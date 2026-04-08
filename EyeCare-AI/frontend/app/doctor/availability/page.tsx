"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { doctorApi } from "@/lib/api/doctor";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Clock, CalendarRange, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS: string[] = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

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

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      try {
        const data = await doctorApi.getAvailability(user._id);
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

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-orange-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 flex-1 z-10 w-full max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
             <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl">
               <CalendarRange className="w-6 h-6" />
             </div>
             Manage Availability
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Define your working hours and appointment capacity.</p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-xl relative overflow-hidden rounded-3xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-amber-500" />
          
          <CardHeader className="md:px-10 pt-10 pb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Clock className="h-6 w-6 text-orange-500" /> Standard Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="md:px-10 pb-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <p>Loading your current schedule...</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
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

                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                  {rows.map((row, idx) => {
                    const isActive = row.startTime && row.endTime && row.maxPatients;
                    return (
                      <motion.div variants={fadeIn} key={row.dayOfWeek} className={`grid grid-cols-[110px,1fr,1fr,90px] md:grid-cols-[140px,1fr,1fr,120px] items-center gap-3 md:gap-6 rounded-2xl border p-4 md:p-5 transition-colors ${isActive ? 'bg-orange-500/5 border-orange-500/30' : 'bg-muted/30 border-border/50 hover:border-border'}`}>
                        <div className="font-bold text-foreground">
                          {row.dayOfWeek}
                          {!isActive && <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5 tracking-wider hidden md:block">Unavailable</p>}
                          {isActive && <p className="text-[10px] text-orange-500 uppercase font-semibold mt-0.5 tracking-wider hidden md:block">Active</p>}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider ml-1">Start Time</Label>
                          <Input
                            type="time"
                            value={row.startTime}
                            onChange={e => {
                              const value = e.target.value;
                              setRows(prev => {
                                const copy = [...prev];
                                copy[idx] = { ...copy[idx], startTime: value };
                                return copy;
                              });
                            }}
                            className={`h-12 rounded-xl border-transparent focus-visible:ring-orange-500/20 focus-visible:border-orange-500 transition-colors ${row.startTime ? 'bg-background shadow-sm border-border/50' : 'bg-muted/50'}`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider ml-1">End Time</Label>
                          <Input
                            type="time"
                            value={row.endTime}
                            onChange={e => {
                              const value = e.target.value;
                              setRows(prev => {
                                const copy = [...prev];
                                copy[idx] = { ...copy[idx], endTime: value };
                                return copy;
                              });
                            }}
                             className={`h-12 rounded-xl border-transparent focus-visible:ring-orange-500/20 focus-visible:border-orange-500 transition-colors ${row.endTime ? 'bg-background shadow-sm border-border/50' : 'bg-muted/50'}`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider ml-1">Capacity</Label>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Qty"
                            value={row.maxPatients}
                            onChange={e => {
                              const value = e.target.value;
                              setRows(prev => {
                                const copy = [...prev];
                                copy[idx] = { ...copy[idx], maxPatients: value };
                                return copy;
                              });
                            }}
                            className={`h-12 rounded-xl border-transparent focus-visible:ring-orange-500/20 focus-visible:border-orange-500 transition-colors ${row.maxPatients ? 'bg-background shadow-sm border-border/50' : 'bg-muted/50 text-center'}`}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>

                <div className="flex justify-end pt-6 border-t border-border/50">
                  <Button type="submit" disabled={saving} className="h-14 px-8 rounded-2xl shadow-lg font-bold text-md hover:scale-[1.02] transition-transform bg-primary text-primary-foreground">
                    {saving ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-foreground" /> Committing Changes...</>
                    ) : (
                      "Save Weekly Schedule"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
