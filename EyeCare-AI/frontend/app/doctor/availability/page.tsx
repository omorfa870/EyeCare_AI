"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { doctorApi } from "@/lib/api/doctor";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, CalendarRange, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, CalendarX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isPast,
} from "date-fns";

const DAYS: string[] = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_ABBR = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

interface DayRow {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxPatients: string;
  availabilityId?: string;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function DoctorAvailabilityPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<DayRow[]>([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [togglingDate, setTogglingDate] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      try {
        const [data, blocked] = await Promise.all([
          doctorApi.getAvailability(user._id),
          doctorApi.getBlockedDates(user._id),
        ]);
        const mapped: DayRow[] = DAYS.map(day => {
          const existing = data.find(a => a.dayOfWeek === day);
          if (existing) {
            return {
              dayOfWeek: day,
              startTime: existing.startTime,
              endTime: existing.endTime,
              maxPatients: String(existing.maxPatients),
              availabilityId: existing._id,
            };
          }
          return { dayOfWeek: day, startTime: "", endTime: "", maxPatients: "" };
        });
        setRows(mapped);
        setBlockedDates(blocked);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    setError("");
    setSuccessMsg("");

    for (const row of rows) {
      const hasData = row.startTime || row.endTime || row.maxPatients;
      if (!hasData) continue;

      if (!row.startTime || !row.endTime || !row.maxPatients) {
        setError(`Please complete all fields for ${row.dayOfWeek} or clear them completely.`);
        return;
      }
      if (row.endTime <= row.startTime) {
        setError(`End time must be after start time on ${row.dayOfWeek}.`);
        return;
      }
      const max = Number(row.maxPatients);
      if (Number.isNaN(max) || max <= 0) {
        setError(`Max patients must be a positive number on ${row.dayOfWeek}.`);
        return;
      }
    }

    setSaving(true);
    try {
      const updatedRows: DayRow[] = [];
      for (const row of rows) {
        const hasData = row.startTime && row.endTime && row.maxPatients;
        if (!hasData) {
          updatedRows.push({ ...row });
          continue;
        }

        const max = Number(row.maxPatients);
        if (row.availabilityId) {
          const saved = await doctorApi.updateAvailability({
            id: row.availabilityId,
            startTime: row.startTime,
            endTime: row.endTime,
            maxPatients: max,
          });
          updatedRows.push({
            dayOfWeek: saved.dayOfWeek,
            startTime: saved.startTime,
            endTime: saved.endTime,
            maxPatients: String(saved.maxPatients),
            availabilityId: saved._id,
          });
        } else {
          const saved = await doctorApi.setAvailability({
            doctorId: user._id,
            dayOfWeek: row.dayOfWeek,
            startTime: row.startTime,
            endTime: row.endTime,
            maxPatients: max,
          });
          updatedRows.push({
            dayOfWeek: saved.dayOfWeek,
            startTime: saved.startTime,
            endTime: saved.endTime,
            maxPatients: String(saved.maxPatients),
            availabilityId: saved._id,
          });
        }
      }
      setRows(updatedRows);
      setSuccessMsg("Weekly schedule updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDate = async (dateStr: string) => {
    setTogglingDate(dateStr);
    try {
      const result = await doctorApi.toggleBlockedDate(dateStr);
      if (result.blocked) {
        setBlockedDates(prev => [...prev, dateStr]);
      } else {
        setBlockedDates(prev => prev.filter(d => d !== dateStr));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingDate(null);
    }
  };

  // Calendar helpers
  const getDaySchedule = (date: Date) => {
    const dayName = DAYS[getDay(date)];
    return rows.find(r => r.dayOfWeek === dayName && r.startTime && r.endTime);
  };

  const isBlocked = (date: Date) => {
    return blockedDates.includes(format(date, "yyyy-MM-dd"));
  };

  const getDayStatus = (date: Date) => {
    if (isBlocked(date)) return "blocked";
    const schedule = getDaySchedule(date);
    if (schedule) return "available";
    return "unavailable";
  };

  const calendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const firstDayOfWeek = getDay(start);
    const paddingDays = Array(firstDayOfWeek).fill(null);
    return { days, paddingDays };
  };

  const { days, paddingDays } = calendarDays();

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-orange-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 flex-1 z-10 w-full max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
             <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl">
               <CalendarRange className="w-6 h-6" />
             </div>
             Manage Availability
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Define your working hours and block off specific dates.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p>Loading your schedule...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Weekly Schedule */}
            <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-xl relative overflow-hidden rounded-3xl">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-orange-400 to-amber-500" />
              <CardHeader className="md:px-8 pt-8 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Clock className="h-6 w-6 text-orange-500" /> Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="md:px-8 pb-8">
                <form onSubmit={handleSave} className="space-y-5">
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm flex items-center gap-3 font-medium overflow-hidden">
                        <AlertCircle className="h-5 w-5 shrink-0" /> {error}
                      </motion.div>
                    )}
                    {successMsg && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-3 font-medium overflow-hidden">
                        <CheckCircle2 className="h-5 w-5 shrink-0" /> {successMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
                    {rows.map((row, idx) => {
                      const isActive = row.startTime && row.endTime && row.maxPatients;
                      return (
                        <motion.div variants={fadeIn} key={row.dayOfWeek} className={`grid grid-cols-[80px,1fr,1fr,70px] items-center gap-2 rounded-2xl border p-3 transition-colors ${isActive ? 'bg-orange-500/5 border-orange-500/30' : 'bg-muted/30 border-border/50'}`}>
                          <div className="font-bold text-sm text-foreground">
                            {row.dayOfWeek.slice(0,3)}
                            {isActive
                              ? <p className="text-[10px] text-orange-500 uppercase font-semibold mt-0.5 tracking-wider">Active</p>
                              : <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5 tracking-wider">Off</p>
                            }
                          </div>

                          <div>
                            <Label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider ml-1">Start</Label>
                            <Input
                              type="time"
                              value={row.startTime}
                              onChange={e => {
                                const value = e.target.value;
                                setRows(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], startTime: value }; return copy; });
                              }}
                              className={`h-10 rounded-xl border-transparent focus-visible:ring-orange-500/20 focus-visible:border-orange-500 transition-colors ${row.startTime ? 'bg-background shadow-sm border-border/50' : 'bg-muted/50'}`}
                            />
                          </div>

                          <div>
                            <Label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider ml-1">End</Label>
                            <Input
                              type="time"
                              value={row.endTime}
                              onChange={e => {
                                const value = e.target.value;
                                setRows(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], endTime: value }; return copy; });
                              }}
                              className={`h-10 rounded-xl border-transparent focus-visible:ring-orange-500/20 focus-visible:border-orange-500 transition-colors ${row.endTime ? 'bg-background shadow-sm border-border/50' : 'bg-muted/50'}`}
                            />
                          </div>

                          <div>
                            <Label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider ml-1">Max</Label>
                            <Input
                              type="number"
                              min={1}
                              placeholder="0"
                              value={row.maxPatients}
                              onChange={e => {
                                const value = e.target.value;
                                setRows(prev => { const copy = [...prev]; copy[idx] = { ...copy[idx], maxPatients: value }; return copy; });
                              }}
                              className={`h-10 rounded-xl border-transparent focus-visible:ring-orange-500/20 focus-visible:border-orange-500 transition-colors text-center ${row.maxPatients ? 'bg-background shadow-sm border-border/50' : 'bg-muted/50'}`}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  <div className="flex justify-end pt-4 border-t border-border/50">
                    <Button type="submit" disabled={saving} className="h-12 px-8 rounded-2xl shadow-lg font-bold hover:scale-[1.02] transition-transform">
                      {saving ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                      ) : (
                        "Save Weekly Schedule"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Date Calendar */}
            <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-xl relative overflow-hidden rounded-3xl">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-blue-400 to-indigo-500" />
              <CardHeader className="md:px-8 pt-8 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <CalendarX className="h-6 w-6 text-blue-500" /> Block Specific Dates
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Click any date to mark it as unavailable (or unblock it).</p>
              </CardHeader>
              <CardContent className="md:px-8 pb-8">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <h3 className="font-bold text-lg text-foreground">{format(currentMonth, "MMMM yyyy")}</h3>
                  <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {DAY_ABBR.map(d => (
                    <div key={d} className="text-center text-xs font-bold text-muted-foreground uppercase py-1">{d}</div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {paddingDays.map((_, i) => <div key={`pad-${i}`} />)}
                  {days.map(day => {
                    const status = getDayStatus(day);
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isCurrentDay = isToday(day);
                    const isPastDay = isPast(day) && !isCurrentDay;
                    const isToggling = togglingDate === dateStr;

                    return (
                      <button
                        key={dateStr}
                        disabled={isPastDay || isToggling}
                        onClick={() => !isPastDay && handleToggleDate(dateStr)}
                        className={`
                          relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all
                          ${isPastDay ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                          ${status === 'blocked' ? 'bg-red-500/20 text-red-500 border-2 border-red-500/40' : ''}
                          ${status === 'available' && !isCurrentDay ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20' : ''}
                          ${status === 'unavailable' && !isCurrentDay ? 'bg-muted/40 text-muted-foreground hover:bg-muted/70' : ''}
                          ${isCurrentDay ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                        `}
                      >
                        {isToggling ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>{format(day, "d")}</span>
                            {status === 'blocked' && <span className="text-[8px] font-black uppercase tracking-wider leading-none mt-0.5">Off</span>}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-3 h-3 rounded-md bg-orange-500/20 border border-orange-500/40" />
                    Available day
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-3 h-3 rounded-md bg-red-500/20 border border-red-500/40" />
                    Blocked date
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-3 h-3 rounded-md bg-muted/60 border border-border/40" />
                    No schedule
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-3 h-3 rounded-md ring-2 ring-primary" />
                    Today
                  </div>
                </div>

                {blockedDates.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Blocked Dates This Month</p>
                    <div className="flex flex-wrap gap-2">
                      {blockedDates
                        .filter(d => d.startsWith(format(currentMonth, "yyyy-MM")))
                        .sort()
                        .map(d => (
                          <Badge key={d} className="bg-red-500/10 text-red-500 border-red-500/20 text-xs font-semibold">
                            {format(new Date(d + "T12:00:00"), "MMM d")}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
