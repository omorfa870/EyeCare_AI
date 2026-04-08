"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/store/authStore";
import { doctorApi } from "@/lib/api/doctor";
import { patientApi } from "@/lib/api/patient";
import { Appointment, EyeRecord } from "@/lib/types";
import { 
  Loader2, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText,
  Video,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  ArrowLeft,
  ExternalLink,
  MapPin,
  ClipboardList,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patientRecords, setPatientRecords] = useState<EyeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [meetLink, setMeetLink] = useState("");
  const [showMeetLinkInput, setShowMeetLinkInput] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointments = await doctorApi.getAppointments(user!._id);
        const apt = appointments.find(a => a._id === params.id);
        
        if (apt) {
          setAppointment(apt);
          setMeetLink(apt.googleMeetLink || "");
          
          const patientId = typeof apt.patient === "object" ? apt.patient._id : apt.patient;
          if (patientId) {
            const records = await patientApi.getRecords(patientId);
            setPatientRecords(records);
          }
        }
      } catch (error) {
        console.error("Failed to fetch appointment:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && params.id) {
      fetchData();
    }
  }, [user, params.id]);

  const handleStatusUpdate = async (status: "confirmed" | "cancelled" | "completed") => {
    if (!appointment) return;
    
    setActionLoading(true);
    try {
      await doctorApi.updateAppointmentStatus({
        appointmentId: appointment._id,
        status,
      });
      
      setAppointment({ ...appointment, status });
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMeetLink = async () => {
    if (!appointment || !meetLink.trim()) return;
    
    setActionLoading(true);
    try {
      await doctorApi.addMeetLink(appointment._id, meetLink);
      setAppointment({ ...appointment, googleMeetLink: meetLink });
      setShowMeetLinkInput(false);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add meet link");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "cancelled":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading appointment session...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex-1 container mx-auto px-6 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center"
        >
          <div className="bg-rose-500/10 p-6 rounded-full inline-block mb-6">
            <AlertCircle className="h-16 w-16 text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Appointment Not Found</h3>
          <p className="text-muted-foreground mb-8 max-w-sm">
            We couldn't retrieve the details for this session. It may have been deleted or moved.
          </p>
          <Button onClick={() => router.back()} className="rounded-xl px-8 h-12 shadow-md">
            Go Back to List
          </Button>
        </motion.div>
      </div>
    );
  }

  const patient = typeof appointment.patient === "object" ? appointment.patient : null;

  return (
    <div className="flex-1 bg-background relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto px-6 py-8 max-w-6xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          
          <div className="flex items-center gap-3">
             <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest hidden md:block">Session Status</span>
             <Badge className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors shadow-sm ${getStatusColor(appointment.status)}`}>
               {appointment.status.toUpperCase()}
             </Badge>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="pb-2 border-b border-border/40">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl font-black tracking-tight text-foreground">Appointment Focus</CardTitle>
                      <CardDescription className="text-lg font-medium text-muted-foreground mt-2">
                        {format(new Date(appointment.date), "EEEE, MMMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <div className={`p-4 rounded-2xl ${appointment.type === "remote" ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                       {appointment.type === "remote" ? <Video className="w-8 h-8" /> : <Building className="w-8 h-8" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-10">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                         <div className="mt-1 p-2.5 bg-muted rounded-xl">
                            <Calendar className="h-5 w-5 text-primary" />
                         </div>
                         <div>
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Scheduled Date</Label>
                            <p className="text-xl font-bold text-foreground mt-1">{format(new Date(appointment.date), "MMM d, yyyy")}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-4">
                         <div className="mt-1 p-2.5 bg-muted rounded-xl">
                            <Clock className="h-5 w-5 text-primary" />
                         </div>
                         <div>
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Time Slot</Label>
                            <p className="text-xl font-bold text-foreground mt-1">{format(new Date(appointment.date), "h:mm a")}</p>
                         </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                         <div className="mt-1 p-2.5 bg-muted rounded-xl">
                            <Activity className="h-5 w-5 text-primary" />
                         </div>
                         <div>
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Consultation Type</Label>
                            <p className="text-xl font-bold text-foreground mt-1">
                               {appointment.type === "remote" ? "Remote Virtual Session" : "In-Person Physical Visit"}
                            </p>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-3xl border border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                       <ClipboardList className="w-5 h-5 text-primary" />
                       <Label className="text-sm font-bold text-foreground uppercase tracking-wider">Clinical Context / Reason</Label>
                    </div>
                    <p className="text-lg text-foreground font-medium italic leading-relaxed">
                       &ldquo;{appointment.reason}&rdquo;
                    </p>
                  </div>

                  {/* Google Meet Link for Remote Sessions */}
                  {appointment.type === "remote" && (
                    <div className="pt-4 border-t border-border/40">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl">
                               <Video className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                               <h4 className="font-bold text-foreground">Virtual Session Channel</h4>
                               <p className="text-sm text-muted-foreground">Secure Google Meet integration enabled.</p>
                            </div>
                         </div>

                         {appointment.googleMeetLink ? (
                            <Button asChild className="rounded-xl h-12 px-6 shadow-md shadow-blue-500/20 bg-blue-600 hover:bg-blue-700">
                               <a href={appointment.googleMeetLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                 Join Meeting <ExternalLink className="h-4 w-4" />
                               </a>
                            </Button>
                         ) : showMeetLinkInput ? (
                            <div className="flex-1 max-w-md flex gap-2">
                               <Input
                                 placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                 value={meetLink}
                                 onChange={(e) => setMeetLink(e.target.value)}
                                 disabled={actionLoading}
                                 className="h-12 rounded-xl bg-background border-border focus-visible:ring-blue-500/20"
                               />
                               <Button
                                 onClick={handleAddMeetLink}
                                 disabled={actionLoading || !meetLink.trim()}
                                 className="rounded-xl h-12 px-6 bg-blue-600 hover:bg-blue-700"
                               >
                                 {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                               </Button>
                               <Button
                                 variant="ghost"
                                 onClick={() => setShowMeetLinkInput(false)}
                                 disabled={actionLoading}
                                 className="rounded-xl h-12"
                               >
                                 Cancel
                               </Button>
                            </div>
                         ) : (
                            <Button
                              variant="outline"
                              className="rounded-xl h-12 px-6 border-dashed border-2 border-blue-500/50 text-blue-600 hover:bg-blue-50"
                              onClick={() => setShowMeetLinkInput(true)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Link Virtual Meeting
                            </Button>
                         )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Diagnosis History */}
            {patientRecords.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-border/40 bg-muted/20">
                    <CardTitle className="flex items-center gap-3 text-2xl font-black">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Eye className="h-6 w-6 text-primary" />
                      </div>
                      Patient Scan History
                      <Badge variant="outline" className="ml-2 font-bold opacity-70">
                         {patientRecords.length} RECORD{patientRecords.length !== 1 ? "S" : ""}
                      </Badge>
                    </CardTitle>
                    <CardDescription>Review automated AI analyses before the consultation.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-6">
                      {patientRecords.map((record, index) => (
                        <div key={record._id} className="relative group">
                          <div className="absolute left-[-24px] top-0 h-full w-1.5 bg-border/40 group-hover:bg-primary/50 transition-all rounded-full hidden md:block" />
                          <div className="border border-border/60 bg-background/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group-hover:border-primary/30">
                            {record.aiAnalysis && (
                              <div className="grid md:grid-cols-12 gap-6 items-center">
                                <div className="md:col-span-4 flex flex-col gap-1">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Detected Condition</span>
                                  <h5 className="text-lg font-black text-foreground">
                                    {record.aiAnalysis.detectedCondition}
                                  </h5>
                                </div>
                                <div className="md:col-span-3 flex flex-col gap-1">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Severity Level</span>
                                  <Badge className={`w-fit font-bold uppercase tracking-widest text-[10px] py-0.5 px-3 rounded-full border ${getStatusColor(record.aiAnalysis.severity)}`}>
                                    {record.aiAnalysis.severity}
                                  </Badge>
                                </div>
                                <div className="md:col-span-3 flex flex-col gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI Confidence</span>
                                  <div className="flex items-center gap-3">
                                     <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-primary" 
                                          style={{ width: `${record.aiAnalysis.probability}%` }}
                                        />
                                     </div>
                                     <span className="text-sm font-bold text-foreground">{record.aiAnalysis.probability}%</span>
                                  </div>
                                </div>
                                <div className="md:col-span-2 text-right">
                                   <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Date</div>
                                   <p className="text-xs font-semibold text-muted-foreground">{format(new Date(record.createdAt), "MMM d, yyyy")}</p>
                                </div>
                                
                                {record.aiAnalysis.notes && (
                                  <div className="md:col-span-12 mt-4 pt-4 border-t border-border/50 text-sm text-foreground/80 font-medium leading-relaxed bg-muted/20 p-4 rounded-xl italic">
                                    &ldquo;{record.aiAnalysis.notes}&rdquo;
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Patient Context Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden text-center sticky top-24">
                <div className="h-24 w-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative">
                   <div className="absolute inset-0 bg-grid-white/10" />
                </div>
                <CardContent className="px-6 pb-8 pt-0 relative">
                  <div className="flex justify-center -mt-12 mb-6">
                    <Avatar className="h-24 w-24 border-4 border-card shadow-2xl">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-600 text-white text-3xl font-black">
                        {patient ? `${patient.profile.firstName[0]}${patient.profile.lastName[0]}` : "P"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <h3 className="text-2xl font-black text-foreground tracking-tight">
                    {patient ? `${patient.profile.firstName} ${patient.profile.lastName}` : "Patient Record"}
                  </h3>
                  <p className="text-sm font-bold text-primary uppercase tracking-widest mt-1">Authorized Patient</p>
                  
                  <Separator className="my-6 opacity-40" />
                  
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-4 group">
                      <div className="p-3 bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors">
                         <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="truncate">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</p>
                        <p className="font-semibold text-foreground truncate">{patient?.email || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 group">
                      <div className="p-3 bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors">
                         <Phone className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contact Number</p>
                        <p className="font-semibold text-foreground">{patient?.profile?.phone || "No contact listed"}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6 opacity-40" />

                  {/* Actions Section */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Management Console</h4>
                    
                    {appointment.status === "pending" && (
                      <div className="grid grid-cols-1 gap-3">
                         <Button
                          className="w-full h-14 rounded-2xl font-black text-md shadow-xl bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] transition-all text-white"
                          onClick={() => handleStatusUpdate("confirmed")}
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                          Confirm Session
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full h-12 rounded-2xl font-bold opacity-80 hover:opacity-100 transition-all"
                          onClick={() => handleStatusUpdate("cancelled")}
                          disabled={actionLoading}
                        >
                          <XCircle className="mr-2 h-5 w-5" />
                          Cancel Request
                        </Button>
                      </div>
                    )}
                    
                    {appointment.status === "confirmed" && (
                      <div className="grid grid-cols-1 gap-3">
                         <Link href={`/doctor/prescription/create?appointmentId=${appointment._id}&patientId=${typeof appointment.patient === "object" ? appointment.patient._id : appointment.patient}`} className="w-full">
                          <Button className="w-full h-14 rounded-2xl font-black text-md shadow-xl bg-primary hover:bg-primary/90 hover:scale-[1.02] transition-all text-primary-foreground">
                            <FileText className="mr-2 h-5 w-5 text-primary-foreground" />
                            Issue Prescription
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full h-12 rounded-2xl font-bold border-2"
                          onClick={() => handleStatusUpdate("completed")}
                          disabled={actionLoading}
                        >
                          <CheckCircle className="mr-2 h-5 w-5 text-emerald-500" />
                          Mark as Completed
                        </Button>
                      </div>
                    )}

                    {appointment.status === "completed" && (
                      <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 text-center">
                        <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                        <p className="font-black text-emerald-700 uppercase tracking-widest text-xs">Consultation Completed</p>
                        <p className="text-sm text-emerald-600/80 mt-2 font-medium">This session record is now archived in patient history.</p>
                      </div>
                    )}

                    {appointment.status === "cancelled" && (
                      <div className="bg-rose-500/10 p-6 rounded-3xl border border-rose-500/20 text-center">
                        <XCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
                        <p className="font-black text-rose-700 uppercase tracking-widest text-xs">Session Cancelled</p>
                        <p className="text-sm text-rose-600/80 mt-2 font-medium">This request was declined or cancelled by the medical officer.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
