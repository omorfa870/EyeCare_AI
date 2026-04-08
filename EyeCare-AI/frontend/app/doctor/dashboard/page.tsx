"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { doctorApi } from "@/lib/api/doctor";
import { Appointment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Clock,
  FileText,
  Loader2,
  Video,
  Building,
  ScanEye,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface DoctorStats {
  totalAppointments: number;
  todayAppointments: number;
  totalPatients: number;
  pendingAppointments: number;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function DoctorDashboardPage() {
  const { user, roleData } = useAuthStore();
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!roleData?._id || !user?._id) {
        setLoading(false);
        return;
      }
      try {
        const [s, appts] = await Promise.all([
          doctorApi.getStats(user._id),
          doctorApi.getAppointments(user._id),
        ]);
        setStats(s);
        setRecentAppointments(appts.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [roleData, user]);

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "completed": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-blue-500/10 blur-[130px] rounded-full mix-blend-screen pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 flex-1 z-10">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col gap-8">
          
          <motion.div variants={fadeIn} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                Welcome, Dr. {user?.profile.firstName}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Your clinic overview and patient metrics for today.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/doctor/upload-scan">
                <Button className="rounded-xl shadow-lg hover:scale-105 transition-all bg-primary text-primary-foreground">
                  <ScanEye className="mr-2 h-4 w-4 text-primary-foreground" /> AI Retinal Scan
                </Button>
              </Link>
            </div>
          </motion.div>

          {loading ? (
             <div className="flex justify-center items-center py-32 text-muted-foreground">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin rounded-full h-8 w-8 text-primary" />
                  <p>Loading clinic metrics...</p>
                </div>
              </div>
          ) : (
            <>
              {/* Stats Bento Grid */}
              <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                    <Calendar className="w-16 h-16 text-blue-500 -mr-4 -mt-4 opacity-50" />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Appts</p>
                    <p className="text-4xl font-black text-foreground">{stats?.totalAppointments ?? 0}</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                    <Clock className="w-16 h-16 text-emerald-500 -mr-4 -mt-4 opacity-50" />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Today's Appts</p>
                    <p className="text-4xl font-black text-emerald-500 dark:text-emerald-400">{stats?.todayAppointments ?? 0}</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                    <Users className="w-16 h-16 text-purple-500 -mr-4 -mt-4 opacity-50" />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Patients</p>
                    <p className="text-4xl font-black text-foreground">{stats?.totalPatients ?? 0}</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                    <FileText className="w-16 h-16 text-amber-500 -mr-4 -mt-4 opacity-50" />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pending Appts</p>
                    <p className="text-4xl font-black text-amber-500 dark:text-amber-400">{stats?.pendingAppointments ?? 0}</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Main Actions & List */}
              <motion.div variants={fadeIn} className="grid lg:grid-cols-3 gap-6">
                
                {/* Left Side: Actions */}
                <div className="lg:col-span-1 space-y-6">
                   <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
                     <CardHeader className="bg-muted/20 border-b border-border/50">
                       <CardTitle className="text-lg">Quick Actions</CardTitle>
                     </CardHeader>
                     <CardContent className="p-4 space-y-3">
                        <Link href="/doctor/upload-scan" className="block">
                          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50 group">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                              <ScanEye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                               <p className="font-semibold text-foreground text-sm">Upload AI Scan</p>
                               <p className="text-xs text-muted-foreground">Analyze patient retina</p>
                            </div>
                          </div>
                        </Link>
                        
                        <Link href="/doctor/appointments" className="block">
                          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50 group">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                              <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                               <p className="font-semibold text-foreground text-sm">Manage Schedule</p>
                               <p className="text-xs text-muted-foreground">View appointments</p>
                            </div>
                          </div>
                        </Link>

                        <Link href="/doctor/availability" className="block">
                          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50 group">
                            <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                              <Clock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                               <p className="font-semibold text-foreground text-sm">Set Availability</p>
                               <p className="text-xs text-muted-foreground">Update working hours</p>
                            </div>
                          </div>
                        </Link>

                        <Link href="/doctor/patients" className="block">
                          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50 group">
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                              <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                               <p className="font-semibold text-foreground text-sm">Patient Directory</p>
                               <p className="text-xs text-muted-foreground">Access medical records</p>
                            </div>
                          </div>
                        </Link>
                     </CardContent>
                   </Card>
                </div>

                {/* Right Side: Recent Appts */}
                <div className="lg:col-span-2 space-y-6">
                   <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden h-full flex flex-col">
                      <CardHeader className="bg-muted/20 border-b border-border/50 flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                           <Activity className="w-5 h-5 text-primary" /> Active Queue
                        </CardTitle>
                        <Link href="/doctor/appointments">
                          <Button variant="outline" size="sm" className="rounded-lg h-8 border-border">View All</Button>
                        </Link>
                      </CardHeader>
                      <CardContent className="p-0 flex-1 flex flex-col">
                         {recentAppointments.length === 0 ? (
                            <div className="py-16 text-center text-muted-foreground flex flex-col items-center flex-1 justify-center">
                              <Clock className="w-12 h-12 mb-4 opacity-50" />
                              <p>No active appointments in the queue.</p>
                            </div>
                         ) : (
                           <div className="divide-y divide-border/50 flex-1">
                              {recentAppointments.map((a) => {
                                const patient = typeof a.patient === "object" ? a.patient : null;
                                return (
                                  <div key={a._id} className="p-4 md:p-6 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                     <div className="flex-1">
                                        <div className="flex items-center flex-wrap gap-3 mb-2">
                                           <h3 className="font-bold text-foreground text-lg">
                                             {patient ? `${patient.profile.firstName} ${patient.profile.lastName}` : "Patient Record"}
                                           </h3>
                                           <Badge variant="outline" className={`border ${statusColor(a.status)} capitalize px-3`}>
                                              {a.status}
                                           </Badge>
                                           <Badge variant="outline" className="border-border bg-background flex items-center gap-1">
                                              {a.type === "remote" ? <Video className="w-3 h-3 text-blue-500" /> : <Building className="w-3 h-3 text-emerald-500" />}
                                              {a.type}
                                           </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                                           <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {format(new Date(a.date), "MMM d, yyyy")}</span>
                                           <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-500"/> {format(new Date(a.date), "h:mm a")}</span>
                                        </div>
                                        {a.reason && <p className="mt-2 text-sm text-foreground/80 font-medium line-clamp-1">{a.reason}</p>}
                                     </div>
                                     <Link href={`/doctor/appointments/${a._id}`} className="shrink-0">
                                       <Button variant="secondary" className="w-full md:w-auto rounded-xl">Review</Button>
                                     </Link>
                                  </div>
                                )
                              })}
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
