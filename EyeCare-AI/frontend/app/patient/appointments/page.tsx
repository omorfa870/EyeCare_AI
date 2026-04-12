"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthHeader } from "@/components/AuthHeader";
import { useAuthStore } from "@/lib/store/authStore";
import { patientApi } from "@/lib/api/patient";
import { Appointment } from "@/lib/types";
import { Loader2, Calendar, Clock, Video, Building, Plus } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (user) {
        try {
          const data = await patientApi.getAppointments(user._id);
          // Sort by newest first
          const sorted = data.sort((a,b) => +new Date(b.date) - +new Date(a.date));
          setAppointments(sorted);
        } catch (error) {
          console.error("Failed to fetch appointments:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAppointments();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex-1 w-full bg-background flex flex-col">
      <div className="container mx-auto px-6 py-10 flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">My Appointments</h1>
              <p className="text-muted-foreground mt-1 text-lg">Manage your past and upcoming consultations.</p>
            </div>
            <Link href="/patient/book-appointment">
              <Button className="rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                <Plus className="h-5 w-5 mr-2" />
                Book Appointment
              </Button>
            </Link>
          </div>

          {loading ? (
             <div className="flex justify-center items-center py-32 text-muted-foreground">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
                  <p>Loading appointments...</p>
                </div>
              </div>
          ) : appointments.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-dashed border-2 border-border/50 bg-background shadow-none flex flex-col items-center justify-center p-12 text-center rounded-3xl">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  No appointments scheduled
                </h3>
                <p className="text-muted-foreground mb-8 max-w-sm">
                  You don't have any appointments in our system yet.
                </p>
                <Link href="/patient/book-appointment">
                  <Button size="lg" className="rounded-xl px-8 shadow-xl shadow-primary/20">Find a Doctor</Button>
                </Link>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4"
            >
              {appointments.map((appointment) => {
                const isPast = new Date(appointment.date) < new Date() && appointment.status !== 'completed';
                
                return (
                  <motion.div variants={fadeIn} key={appointment._id}>
                    <Card className={`overflow-hidden transition-all hover:shadow-md border border-border/50 ${isPast ? 'opacity-70 grayscale-[0.2]' : ''}`}>
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row items-stretch">
                          {/* Left Date Block */}
                          <div className="bg-muted/30 p-6 md:w-64 flex flex-col justify-center items-center md:items-start border-b md:border-b-0 md:border-r border-border/50">
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                              {format(new Date(appointment.date), "MMM yyyy")}
                            </span>
                            <span className="text-4xl font-black text-foreground mb-1">
                              {format(new Date(appointment.date), "dd")}
                            </span>
                            <span className="text-md font-medium text-muted-foreground">
                              {format(new Date(appointment.date), "EEEE")}
                            </span>
                          </div>
                          
                          {/* Right Details Block */}
                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(appointment.status)}`}>
                                    {appointment.status}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1 rounded-full">
                                    {appointment.type === "remote" ? (
                                      <><Video className="h-3.5 w-3.5 text-blue-500" /> Teleconsultation</>
                                    ) : (
                                      <><Building className="h-3.5 w-3.5 text-emerald-500" /> Physical Visit</>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3 text-lg text-foreground font-semibold">
                                  <Clock className="h-5 w-5 text-primary" />
                                  {format(new Date(appointment.date), "h:mm a")}
                                </div>
                              </div>
                              
                              <div className="bg-muted/30 p-4 rounded-xl max-w-xs w-full">
                                 <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Reason for visit</p>
                                 <p className="text-sm text-foreground">{appointment.reason || "Not specified"}</p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                              {appointment.googleMeetLink && appointment.status === "confirmed" && (
                                <Button className="rounded-xl shadow-lg hover:scale-[1.02]" asChild>
                                  <a href={appointment.googleMeetLink} target="_blank" rel="noopener noreferrer">
                                    <Video className="h-4 w-4 mr-2" /> Join Google Meet
                                  </a>
                                </Button>
                              )}
                              {appointment.status === "pending" && (
                                <Button variant="outline" className="rounded-xl">Cancel Request</Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
  );
}
