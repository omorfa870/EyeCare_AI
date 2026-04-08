"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthHeader } from "@/components/AuthHeader";
import { useAuthStore } from "@/lib/store/authStore";
import { patientApi } from "@/lib/api/patient";
import { Appointment, Prescription } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, MapPin, ScanEye, Video, Building, Clock, FileBarChart2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function PatientDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<{ totalScans: number; totalAppointments: number; totalPrescriptions: number; totalReports: number } | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        const s = await patientApi.getStats(user._id);
        setStats(s);

        const appts = await patientApi.getAppointments(user._id);
        const future = appts
          .filter(a => new Date(a.date) > new Date())
          .sort((a, b) => +new Date(a.date) - +new Date(b.date));
        setNextAppointment(future[0] || null);

        const pres = await patientApi.getPrescriptions(user._id);
        const sorted = [...pres].sort((a, b) => +new Date(b.date) - +new Date(a.date));
        setRecentPrescriptions(sorted.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  return (
    <div className="flex-1 w-full bg-background flex flex-col overflow-hidden relative">
      {/* Soft Background Orbs */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-[500px] h-[400px] bg-blue-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 z-10">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="h-full flex flex-col gap-8"
          >
            {/* Header Greeting */}
            <motion.div variants={fadeIn} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                  Welcome back, {user?.profile?.firstName || "Patient"}.
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  Here is the latest overview of your eye health journey.
                </p>
              </div>
              <div className="flex gap-3">
                 <Link href="/patient/book-appointment">
                    <Button className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105">
                      <Calendar className="mr-2 h-4 w-4" /> Book Consultation
                    </Button>
                 </Link>
                 <Link href="/patient/symptom-checker">
                    <Button variant="secondary" className="rounded-xl border border-border shadow-sm transition-all hover:scale-105">
                      <ScanEye className="mr-2 h-4 w-4 text-primary" /> Symptom Checker
                    </Button>
                 </Link>
              </div>
            </motion.div>

            {loading ? (
              <div className="flex justify-center items-center py-32 text-muted-foreground w-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
                  <p>Loading your health data...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Stats Bento Grid */}
                <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                       <CardDescription className="font-semibold flex items-center gap-2">
                         <Calendar className="w-4 h-4 text-blue-500" /> Appointments
                       </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl md:text-4xl font-black text-foreground">{stats?.totalAppointments ?? 0}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                       <CardDescription className="font-semibold flex items-center gap-2">
                         <FileText className="w-4 h-4 text-orange-500" /> Prescriptions
                       </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl md:text-4xl font-black text-foreground">{stats?.totalPrescriptions ?? 0}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                       <CardDescription className="font-semibold flex items-center gap-2">
                         <FileBarChart2 className="w-4 h-4 text-purple-500" /> Reports
                       </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl md:text-4xl font-black text-foreground">{stats?.totalReports ?? 0}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                       <CardDescription className="font-semibold flex items-center gap-2">
                         <ScanEye className="w-4 h-4 text-emerald-500" /> AI Scans
                       </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl md:text-4xl font-black text-foreground">{stats?.totalScans ?? 0}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Main Action Grids */}
                <motion.div variants={fadeIn} className="grid lg:grid-cols-3 gap-6">
                  {/* Left Column (2/3 width on LG): Next Appt + Map */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Next Appointment Focus Card */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                      <CardHeader className="pb-3 border-b border-border/50 bg-muted/30">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Clock className="h-5 w-5 text-primary" /> Upcoming Consultation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        {nextAppointment ? (
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                               <p className="text-2xl font-bold text-foreground mb-1">
                                {format(new Date(nextAppointment.date), "MMM d, yyyy")}
                               </p>
                               <p className="text-lg text-muted-foreground font-medium mb-3">
                                 {format(new Date(nextAppointment.date), "h:mm a")}
                               </p>
                               <div className="flex items-center gap-4 text-sm font-medium">
                                 <span className="flex items-center gap-1.5 text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1 rounded-md">
                                  {nextAppointment.type === "remote" ? <><Video className="w-4 h-4 text-blue-500"/> Remote Video</> : <><Building className="w-4 h-4 text-emerald-500"/> Physical Visit</>}
                                 </span>
                                 <span className="flex items-center gap-1.5 text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1 rounded-md">
                                   Status: <span className="capitalize text-primary">{nextAppointment.status}</span>
                                 </span>
                               </div>
                            </div>

                            <div className="flex flex-col gap-3 min-w-[200px]">
                              {nextAppointment.googleMeetLink && (
                                <Button className="w-full shadow-lg hover:scale-[1.02] transition-transform rounded-xl" asChild>
                                  <a href={nextAppointment.googleMeetLink} target="_blank" rel="noopener noreferrer">
                                     <Video className="mr-2 h-4 w-4" /> Join Meet Link
                                  </a>
                                </Button>
                              )}
                              <Link href="/patient/appointments" className="w-full">
                                <Button className="w-full rounded-xl" variant="outline">Manage Reschedule</Button>
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                              <Calendar className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Appointments</h3>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                              You don't have any future check-ups scheduled with an eye doctor yet.
                            </p>
                            <Link href="/patient/book-appointment">
                              <Button className="rounded-xl shadow-lg shadow-primary/20">Find a Doctor & Book</Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Maps Promo Card */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden group">
                      <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-emerald-500" />
                          Nearby Hospital Locator
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <p className="text-muted-foreground leading-relaxed max-w-md">
                          Need an urgent physical consultation? Use our integrated map service to find top-rated eye-care facilities closest to your current location.
                        </p>
                        <Link href="/patient/hospitals" className="shrink-0">
                          <Button variant="secondary" className="rounded-xl group-hover:bg-emerald-500 hover:text-white transition-colors">
                            <MapPin className="w-4 h-4 mr-2" /> Open Maps
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column (1/3 width on LG): RX History */}
                  <div className="lg:col-span-1">
                    <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm h-full flex flex-col">
                      <CardHeader className="border-b border-border/50 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5 text-orange-500" />
                            Latest Prescriptions
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 flex-1 flex flex-col">
                        {recentPrescriptions.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-60">
                            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                            <p className="text-sm font-medium">No recorded prescriptions</p>
                            <p className="text-xs text-muted-foreground mt-1 px-4">They will appear here after a completed consultation.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 flex-1">
                            {recentPrescriptions.map(p => (
                              <Link
                                key={p._id}
                                href={`/patient/prescriptions/${p._id}`}
                                className="group flex flex-col gap-1 p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/80 hover:border-primary/30 transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {format(new Date(p.date), "MMM d, yyyy")}
                                  </p>
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Doc</span>
                                </div>
                                {p.diagnosis && p.diagnosis.length > 0 ? (
                                  <p className="text-xs text-muted-foreground truncate font-mono mt-1">
                                    Dx: {p.diagnosis.join(", ")}
                                  </p>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic mt-1">General Review</p>
                                )}
                              </Link>
                            ))}
                            <div className="mt-auto pt-4">
                               <Link href="/patient/prescriptions" className="w-full">
                                  <Button variant="outline" className="w-full rounded-xl text-primary hover:bg-primary/5 border-primary/20">
                                    View Full History
                                  </Button>
                                </Link>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
  );
}
