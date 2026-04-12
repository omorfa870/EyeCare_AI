"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/authStore";
import { patientApi } from "@/lib/api/patient";
import { commonApi, DoctorWithUser } from "@/lib/api/common";
import { doctorApi } from "@/lib/api/doctor";
import { Loader2, Calendar, CheckCircle, Video, Building, Search, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isToday,
  isPast,
  isSameDay,
} from "date-fns";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_ABBR = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function BookAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [doctors, setDoctors] = useState<DoctorWithUser[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorWithUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithUser | null>(null);

  // Doctor availability state
  const [doctorAvailability, setDoctorAvailability] = useState<{ dayOfWeek: string; startTime: string; endTime: string }[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    reason: "",
    type: "remote" as "remote" | "physical",
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await commonApi.getDoctors();
        setDoctors(data);
        setFilteredDoctors(data);

        const doctorIdFromUrl = searchParams.get("doctorId");
        if (doctorIdFromUrl) {
          const preSelectedDoctor = data.find(d => d.user._id === doctorIdFromUrl);
          if (preSelectedDoctor) {
            setSelectedDoctor(preSelectedDoctor);
            setFormData(prev => ({ ...prev, doctorId: doctorIdFromUrl }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [searchParams]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDoctors(doctors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = doctors.filter(doctor =>
        doctor.user.profile.firstName.toLowerCase().includes(query) ||
        doctor.user.profile.lastName.toLowerCase().includes(query) ||
        doctor.specialization.toLowerCase().includes(query) ||
        doctor.qualifications.some(q => q.toLowerCase().includes(query))
      );
      setFilteredDoctors(filtered);
    }
  }, [searchQuery, doctors]);

  // Load doctor availability when a doctor is selected
  useEffect(() => {
    if (!selectedDoctor) return;
    const doctorUserId = selectedDoctor.user._id;
    setLoadingAvailability(true);
    Promise.all([
      doctorApi.getAvailability(doctorUserId),
      doctorApi.getBlockedDates(doctorUserId),
    ]).then(([avail, blocked]) => {
      setDoctorAvailability(avail.filter(a => a.startTime && a.endTime));
      setBlockedDates(blocked);
      setSelectedDate(null);
      setFormData(prev => ({ ...prev, date: "" }));
    }).catch(console.error).finally(() => setLoadingAvailability(false));
  }, [selectedDoctor]);

  const handleDoctorSelect = (doctor: DoctorWithUser) => {
    setSelectedDoctor(doctor);
    setFormData({ ...formData, doctorId: doctor.user._id });
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    if (blockedDates.includes(dateStr)) return false;
    const dayName = DAYS[getDay(date)];
    return doctorAvailability.some(a => a.dayOfWeek === dayName);
  };

  const getDaySchedule = (date: Date) => {
    const dayName = DAYS[getDay(date)];
    return doctorAvailability.find(a => a.dayOfWeek === dayName);
  };

  const handleCalendarDateClick = (date: Date) => {
    if (!isDateAvailable(date)) return;
    setSelectedDate(date);
    const schedule = getDaySchedule(date);
    if (schedule) {
      // Pre-fill the date-time with the doctor's start time on that date
      const [h, m] = schedule.startTime.split(":");
      const dt = new Date(date);
      dt.setHours(Number(h), Number(m), 0, 0);
      const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setFormData(prev => ({ ...prev, date: local }));
    }
  };

  const calendarDays = () => {
    const start = startOfMonth(calendarMonth);
    const end = endOfMonth(calendarMonth);
    const days = eachDayOfInterval({ start, end });
    const firstDayOfWeek = getDay(start);
    const paddingDays = Array(firstDayOfWeek).fill(null);
    return { days, paddingDays };
  };

  const { days, paddingDays } = calendarDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const selectedDateVal = new Date(formData.date);
    const now = new Date();
    if (selectedDateVal <= now) {
      setError("Please select a future date and time");
      return;
    }

    if (!user?._id) {
      setError("Patient information not found");
      return;
    }

    setLoading(true);

    try {
      await patientApi.bookAppointment({
        patientId: user?._id,
        doctorId: formData.doctorId,
        date: formData.date,
        reason: formData.reason,
        type: formData.type,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/patient/appointments");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 max-w-5xl flex-1 z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-blue-500" />
            <CardHeader className="pb-8 text-center pt-10">
              <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Book Consultation</CardTitle>
              <CardDescription className="text-lg mt-2 font-medium">
                Schedule an appointment with an expert ophthalmologist.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 md:px-12 pb-12">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto mb-6 drop-shadow-lg" />
                    <h3 className="text-2xl font-bold text-foreground mb-3">Appointment Confirmed!</h3>
                    <p className="text-muted-foreground">
                      Your appointment has been successfully booked. Redirecting you...
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-8"
                  >
                    {error && (
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-medium">
                        {error}
                      </div>
                    )}

                    {/* Doctor Selection */}
                    <div className="space-y-4">
                      <Label className="text-base text-foreground font-semibold">1. Select a Doctor</Label>
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name, specialty, or condition..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-11 h-12 rounded-xl bg-background border-border/60 focus-visible:ring-primary shadow-sm"
                          disabled={loading || success}
                        />
                      </div>

                      <div className="border border-border/50 rounded-2xl bg-muted/20 overflow-hidden">
                        {loadingDoctors ? (
                          <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                            <p className="text-muted-foreground text-sm">Searching network...</p>
                          </div>
                        ) : filteredDoctors.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No specialists found matching your search.</p>
                          </div>
                        ) : (
                          <div className="max-h-[280px] overflow-y-auto p-2 space-y-2">
                            {filteredDoctors.map((doctor) => {
                              const isSelected = selectedDoctor?._id === doctor._id;
                              return (
                                <div
                                  key={doctor._id}
                                  onClick={() => handleDoctorSelect(doctor)}
                                  className={`relative p-4 rounded-xl cursor-pointer transition-all border ${
                                    isSelected
                                      ? "bg-primary/5 border-primary shadow-sm"
                                      : "bg-background border-transparent hover:border-border hover:bg-muted/50"
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border border-border">
                                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {doctor.user.profile.firstName[0]}{doctor.user.profile.lastName[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 pr-8">
                                      <p className="font-bold text-foreground text-lg leading-tight">
                                        Dr. {doctor.user.profile.firstName} {doctor.user.profile.lastName}
                                      </p>
                                      <p className="text-sm font-medium text-primary mt-0.5">{doctor.specialization}</p>
                                      <p className="text-xs text-muted-foreground mt-1 truncate">
                                        {doctor.qualifications.join(", ")}
                                      </p>
                                    </div>
                                    {isSelected && (
                                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <CheckCircle className="h-6 w-6 text-primary drop-shadow-md" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Doctor Availability Calendar */}
                    <AnimatePresence>
                      {selectedDoctor && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border border-border/50 rounded-2xl bg-muted/10 p-5 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-5 w-5 text-primary" />
                              <p className="font-semibold text-foreground">
                                Dr. {selectedDoctor.user.profile.firstName}&apos;s Availability
                              </p>
                            </div>

                            {loadingAvailability ? (
                              <div className="flex items-center gap-2 text-muted-foreground py-4 justify-center">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading schedule...
                              </div>
                            ) : doctorAvailability.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                This doctor has not set their availability yet.
                              </p>
                            ) : (
                              <>
                                {/* Weekly schedule summary */}
                                <div className="flex flex-wrap gap-2 pb-3 border-b border-border/40">
                                  {doctorAvailability.map(a => (
                                    <Badge key={a.dayOfWeek} className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {a.dayOfWeek.slice(0,3)}: {a.startTime}–{a.endTime}
                                    </Badge>
                                  ))}
                                </div>

                                {/* Month calendar */}
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" type="button" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
                                      <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="font-bold text-sm text-foreground">{format(calendarMonth, "MMMM yyyy")}</span>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" type="button" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-7 mb-1">
                                    {DAY_ABBR.map(d => (
                                      <div key={d} className="text-center text-[10px] font-bold text-muted-foreground uppercase py-1">{d}</div>
                                    ))}
                                  </div>
                                  <div className="grid grid-cols-7 gap-1">
                                    {paddingDays.map((_, i) => <div key={`pad-${i}`} />)}
                                    {days.map(day => {
                                      const available = isDateAvailable(day);
                                      const isPastDay = isPast(day) && !isToday(day);
                                      const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                                      const dateStr = format(day, "yyyy-MM-dd");
                                      const blocked = blockedDates.includes(dateStr);

                                      return (
                                        <button
                                          key={dateStr}
                                          type="button"
                                          disabled={!available || isPastDay}
                                          onClick={() => handleCalendarDateClick(day)}
                                          className={`
                                            aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all
                                            ${isPastDay ? 'opacity-25 cursor-not-allowed text-muted-foreground' : ''}
                                            ${!available && !isPastDay ? 'text-muted-foreground/40 cursor-not-allowed' : ''}
                                            ${available && !isSelected ? 'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer hover:scale-105' : ''}
                                            ${isSelected ? 'bg-primary text-primary-foreground shadow-md scale-105' : ''}
                                            ${blocked ? 'bg-red-500/10 text-red-400 cursor-not-allowed' : ''}
                                            ${isToday(day) ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : ''}
                                          `}
                                        >
                                          {format(day, "d")}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="flex gap-3 flex-wrap pt-1">
                                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <span className="w-3 h-3 rounded bg-primary/15 border border-primary/30 inline-block" /> Available
                                  </span>
                                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <span className="w-3 h-3 rounded bg-primary inline-block" /> Selected
                                  </span>
                                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <span className="w-3 h-3 rounded bg-red-500/15 border border-red-400/30 inline-block" /> Blocked
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Consultation Type */}
                    <div className="space-y-4 pt-2">
                      <Label className="text-base text-foreground font-semibold">2. Consultation Type</Label>
                      <RadioGroup
                        value={formData.type}
                        onValueChange={(value: "remote" | "physical") =>
                          setFormData({ ...formData, type: value })
                        }
                        disabled={loading || success}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        <div className={`relative flex items-center space-x-2 border-2 rounded-xl p-5 cursor-pointer transition-all ${
                          formData.type === "remote" ? "border-primary bg-primary/5" : "border-border/50 hover:bg-muted/50"
                        }`}>
                          <RadioGroupItem value="remote" id="remote" className="absolute right-4" />
                          <Label htmlFor="remote" className="flex-1 cursor-pointer flex items-center gap-4">
                            <div className={`p-3 rounded-full ${formData.type === "remote" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                              <Video className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-base">Teleconsultation</p>
                              <p className="text-sm text-muted-foreground mt-0.5">Secure Google Meet call</p>
                            </div>
                          </Label>
                        </div>

                        <div className={`relative flex items-center space-x-2 border-2 rounded-xl p-5 cursor-pointer transition-all ${
                          formData.type === "physical" ? "border-primary bg-primary/5" : "border-border/50 hover:bg-muted/50"
                        }`}>
                          <RadioGroupItem value="physical" id="physical" className="absolute right-4" />
                          <Label htmlFor="physical" className="flex-1 cursor-pointer flex items-center gap-4">
                            <div className={`p-3 rounded-full ${formData.type === "physical" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                              <Building className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-base">Physical Visit</p>
                              <p className="text-sm text-muted-foreground mt-0.5">At the hospital</p>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                      {/* Date & Time */}
                      <div className="space-y-4">
                        <Label htmlFor="date" className="text-base text-foreground font-semibold">3. Date &amp; Time</Label>
                        <Input
                          id="date"
                          type="datetime-local"
                          min={getMinDateTime()}
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                          disabled={loading || success}
                          className="h-12 rounded-xl border-border/60 bg-background shadow-sm"
                        />
                        {selectedDate && (
                          <p className="text-xs text-primary font-medium">
                            Selected: {format(selectedDate, "EEEE, MMMM d")} — within {getDaySchedule(selectedDate)?.startTime}–{getDaySchedule(selectedDate)?.endTime}
                          </p>
                        )}
                      </div>

                      {/* Reason */}
                      <div className="space-y-4">
                        <Label htmlFor="reason" className="text-base text-foreground font-semibold">4. Reason for Visit</Label>
                        <Textarea
                          id="reason"
                          placeholder="Briefly describe your symptoms or reason..."
                          value={formData.reason}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          required
                          disabled={loading || success}
                          rows={3}
                          className="rounded-xl border-border/60 bg-background shadow-sm resize-none"
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-6 mt-6 border-t border-border/50">
                      <Button
                        type="submit"
                        disabled={loading || !formData.doctorId || success}
                        className="w-full h-14 rounded-xl text-lg font-semibold shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Processing Secure Booking...
                          </>
                        ) : (
                          <>
                            <Calendar className="mr-3 h-5 w-5" />
                            Confirm Appointment Ticket
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
