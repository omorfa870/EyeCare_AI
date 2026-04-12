"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/authStore";
import { doctorApi } from "@/lib/api/doctor";
import { Appointment } from "@/lib/types";
import { Loader2, Calendar, Video, Building, ArrowRight, UserSquare2, Clock, Link2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function DoctorAppointmentsPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Meet link dialog state
  const [meetDialog, setMeetDialog] = useState<{ appointmentId: string; existingLink?: string } | null>(null);
  const [meetLink, setMeetLink] = useState("");
  const [savingLink, setSavingLink] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (user) {
        try {
          const data = await doctorApi.getAppointments(user._id);
          const sorted = data.sort((a, b) => +new Date(b.date) - +new Date(a.date));
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

  const filterAppointments = (status?: string) => {
    if (!status || status === "all") return appointments;
    return appointments.filter(apt => apt.status === status);
  };

  const openMeetDialog = (appointment: Appointment) => {
    setMeetLink(appointment.googleMeetLink || "");
    setLinkSuccess(false);
    setMeetDialog({ appointmentId: appointment._id, existingLink: appointment.googleMeetLink });
  };

  const handleSaveMeetLink = async () => {
    if (!meetDialog) return;
    setSavingLink(true);
    try {
      await doctorApi.addMeetLink(meetDialog.appointmentId, meetLink);
      // Update local state
      setAppointments(prev => prev.map(a =>
        a._id === meetDialog.appointmentId ? { ...a, googleMeetLink: meetLink } : a
      ));
      setLinkSuccess(true);
      setTimeout(() => {
        setMeetDialog(null);
        setLinkSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingLink(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "completed": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const renderAppointments = (filteredAppointments: Appointment[]) => {
    if (filteredAppointments.length === 0) {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-dashed border-2 border-border/50 bg-background shadow-none flex flex-col items-center justify-center p-12 text-center rounded-3xl mt-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Calendar className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No appointments found</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              There are no appointments matching this filter criteria at the moment.
            </p>
          </Card>
        </motion.div>
      );
    }

    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 mt-6">
        {filteredAppointments.map((appointment) => {
          const patient = typeof appointment.patient === "object" ? appointment.patient : null;
          const isPast = new Date(appointment.date) < new Date() && appointment.status !== 'completed';
          const isRemote = appointment.type === "remote";
          const isConfirmed = appointment.status === "confirmed";
          const canSendMeetLink = isRemote && isConfirmed;

          return (
            <motion.div variants={fadeIn} key={appointment._id}>
              <Card className={`overflow-hidden transition-all hover:shadow-md border border-border/50 bg-card/60 backdrop-blur-md group ${isPast ? 'opacity-80 grayscale-[0.1]' : ''}`}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-stretch">
                    {/* Left Date Block */}
                    <div className="bg-muted/30 p-6 md:w-56 flex flex-col justify-center items-center md:items-start border-b md:border-b-0 md:border-r border-border/50 relative overflow-hidden">
                      <div className={`absolute left-0 top-0 w-1 h-full ${appointment.status === 'confirmed' ? 'bg-emerald-500' : appointment.status === 'pending' ? 'bg-amber-500' : 'bg-transparent'}`} />
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
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full">
                              {isRemote ? (
                                <><Video className="h-3.5 w-3.5 text-blue-500" /> Remote</>
                              ) : (
                                <><Building className="h-3.5 w-3.5 text-emerald-500" /> Physical</>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <UserSquare2 className="w-5 h-5 text-muted-foreground" />
                            <h3 className="font-bold text-xl text-foreground">
                              {patient ? `${patient.profile.firstName} ${patient.profile.lastName}` : "Patient"}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 text-lg text-foreground font-semibold">
                            <Clock className="h-4 w-4 text-primary" />
                            {format(new Date(appointment.date), "h:mm a")}
                          </div>

                          {/* Show existing meet link */}
                          {isRemote && appointment.googleMeetLink && (
                            <a
                              href={appointment.googleMeetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-blue-500 hover:underline"
                            >
                              <Video className="h-3.5 w-3.5" /> {appointment.googleMeetLink}
                            </a>
                          )}
                        </div>

                        <div className="bg-muted/30 p-4 rounded-xl md:max-w-[250px] w-full self-start">
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Reason for visit</p>
                          <p className="text-sm text-foreground line-clamp-3 font-medium">{appointment.reason || "Not specified"}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-end gap-3 pt-4 mt-6 border-t border-border/50">
                        {/* Send Meet Link button — only for confirmed remote appointments */}
                        {canSendMeetLink && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openMeetDialog(appointment)}
                            className="rounded-xl border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 font-semibold"
                          >
                            <Link2 className="h-4 w-4 mr-2" />
                            {appointment.googleMeetLink ? "Update Meet Link" : "Send Meet Link"}
                          </Button>
                        )}
                        <Link href={`/doctor/appointments/${appointment._id}`}>
                          <Button className="rounded-xl shadow-md hover:scale-[1.02] transition-transform bg-primary text-primary-foreground hover:bg-primary/90">
                            Review Details <ArrowRight className="ml-2 h-4 w-4 text-primary-foreground" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 flex-1 z-10 w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Master Schedule</h1>
          <p className="text-muted-foreground mt-1 text-lg">Organize and prepare for your upcoming patient consultations.</p>
        </div>

        {loading ? (
          <div className="flex justify-center flex-col items-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Syncing schedule...</p>
          </div>
        ) : (
          <div className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-muted/50 p-1 rounded-xl h-auto border border-border/50 grid grid-cols-2 md:inline-flex md:grid-cols-4 mb-2">
                <TabsTrigger value="all" className="rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  All ({appointments.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Pending ({filterAppointments("pending").length})
                </TabsTrigger>
                <TabsTrigger value="confirmed" className="rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Confirmed ({filterAppointments("confirmed").length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Completed ({filterAppointments("completed").length})
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="all" className="mt-0">{renderAppointments(appointments)}</TabsContent>
                  <TabsContent value="pending" className="mt-0">{renderAppointments(filterAppointments("pending"))}</TabsContent>
                  <TabsContent value="confirmed" className="mt-0">{renderAppointments(filterAppointments("confirmed"))}</TabsContent>
                  <TabsContent value="completed" className="mt-0">{renderAppointments(filterAppointments("completed"))}</TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>
        )}
      </div>

      {/* Google Meet Link Dialog */}
      <Dialog open={!!meetDialog} onOpenChange={(open) => !open && setMeetDialog(null)}>
        <DialogContent className="rounded-3xl border-border/50 bg-card/95 backdrop-blur-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-500" /> Send Google Meet Link
            </DialogTitle>
            <DialogDescription>
              Enter the Google Meet link to share with this patient for their remote consultation.
            </DialogDescription>
          </DialogHeader>

          {linkSuccess ? (
            <div className="flex flex-col items-center py-6 gap-3 text-emerald-500">
              <CheckCircle2 className="h-12 w-12" />
              <p className="font-bold text-foreground">Meet link sent successfully!</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 py-2">
                <Label htmlFor="meetLink" className="font-semibold">Google Meet URL</Label>
                <Input
                  id="meetLink"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  className="h-12 rounded-xl bg-muted/50 border-transparent focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                />
                <p className="text-xs text-muted-foreground">
                  The patient will see this link in their appointments dashboard.
                </p>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setMeetDialog(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={savingLink || !meetLink.trim()}
                  onClick={handleSaveMeetLink}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {savingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Link2 className="h-4 w-4 mr-2" /> Send Link</>}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
