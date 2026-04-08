"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/store/authStore";
import { doctorApi } from "@/lib/api/doctor";
import { Appointment, EyeRecord, Prescription } from "@/lib/types";
import { 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Eye,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ActivitySquare
} from "lucide-react";
import { format } from "date-fns";
import { patientApi } from "@/lib/api/patient";
import { motion, AnimatePresence } from "framer-motion";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [eyeRecords, setEyeRecords] = useState<EyeRecord[]>([]);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (user?._id && params.id) {
        try {
          const allAppointments = await doctorApi.getAppointments(user._id);
          const patientAppointments = allAppointments.filter(apt => 
            typeof apt.patient === "object" && apt.patient._id === params.id
          ).sort((a,b) => +new Date(b.date) - +new Date(a.date));
          setAppointments(patientAppointments);

          if (patientAppointments.length > 0 && typeof patientAppointments[0].patient === "object") {
            setPatient(patientAppointments[0].patient);
          }

          const allPrescriptions = await patientApi.getPrescriptions(params.id as string);
          setPrescriptions(allPrescriptions.sort((a,b) => +new Date(b.date) - +new Date(a.date)));

          const records = await doctorApi.getPatientRecords(params.id as string);
          setEyeRecords(records.sort((a:any,b:any) => +new Date(b.createdAt) - +new Date(a.createdAt)));
        } catch (error) {
          console.error("Failed to fetch patient data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPatientData();
  }, [user, params.id]);

  if (loading) {
    return (
      <div className="flex-1 w-full flex justify-center items-center py-32 text-muted-foreground bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-purple-500/10 blur-[130px] rounded-full mix-blend-screen pointer-events-none -z-10" />
        <div className="flex flex-col items-center gap-4 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p>Retrieving secure health record...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex-1 w-full bg-background relative overflow-hidden h-full flex items-center justify-center p-6">
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-destructive/10 blur-[130px] rounded-full mix-blend-screen pointer-events-none -z-10" />
        <Card className="border-destructive/20 bg-destructive/5 shadow-none flex flex-col items-center justify-center p-12 text-center rounded-3xl w-full max-w-md">
           <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
           <h3 className="text-xl font-bold mb-2 text-foreground">Patient Record Missing</h3>
           <p className="text-muted-foreground mb-6">This record could not be found or you lack permissions.</p>
           <Button onClick={() => router.back()} className="rounded-xl px-8 shadow-xl">Return to Directory</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-10 right-20 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 flex-1 z-10 w-full">

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
          
          {/* Patient Header Card */}
          <motion.div variants={fadeIn}>
            <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-lg relative overflow-hidden rounded-3xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
              <CardContent className="pt-8 pb-8 px-6 md:px-10">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                  <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-3xl font-extrabold">
                      {patient.profile.firstName[0]}{patient.profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-black text-foreground mb-2">
                       {patient.profile.firstName} {patient.profile.lastName}
                    </h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 mt-4 md:mt-3">
                      <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/40 text-sm text-foreground font-medium">
                        <Mail className="h-4 w-4 text-purple-500" />
                        <span>{patient.email}</span>
                      </div>
                      {patient.profile.phone && (
                        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/40 text-sm text-foreground font-medium">
                          <Phone className="h-4 w-4 text-emerald-500" />
                          <span>{patient.profile.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full md:w-auto mt-4 md:mt-0">
                     <Link href={`/doctor/prescription/create?patientId=${patient._id}`}>
                        <Button className="w-full md:w-auto rounded-xl shadow-lg hover:scale-[1.02] transition-transform group bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                          <ActivitySquare className="w-4 h-4" /> Generate Prescription
                        </Button>
                     </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn} className="w-full">
            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="bg-muted/50 p-1.5 rounded-xl h-auto border border-border/50 grid grid-cols-3 mb-6 shadow-sm">
                <TabsTrigger value="appointments" className="rounded-lg py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Appts <Badge variant="secondary" className="ml-1 opacity-80">{appointments.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="prescriptions" className="rounded-lg py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Rx <Badge variant="secondary" className="ml-1 opacity-80">{prescriptions.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="records" className="rounded-lg py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold tracking-wide flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Scans <Badge variant="secondary" className="ml-1 opacity-80">{eyeRecords.length}</Badge>
                </TabsTrigger>
              </TabsList>

              {/* Appointments */}
              <TabsContent value="appointments" className="mt-0 outline-none">
                {appointments.length === 0 ? (
                  <Card className="border-dashed border-2 border-border/50 bg-background/50 shadow-none flex flex-col items-center py-16 text-center rounded-3xl mt-4">
                     <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                     <p className="text-muted-foreground font-medium text-lg">No appointment history found.</p>
                  </Card>
                ) : (
                  <div className="grid gap-4 mt-4">
                     {appointments.map((apt) => (
                        <Card key={apt._id} className="hover:shadow-md transition-shadow border-border/50 bg-card/60 backdrop-blur-sm group">
                          <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                             <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                   <Badge className={
                                     apt.status === "completed" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                     apt.status === "confirmed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                     apt.status === "cancelled" ? "bg-destructive/10 text-destructive border-destructive/20" :
                                     "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                   }>
                                     {apt.status}
                                   </Badge>
                                   <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {format(new Date(apt.date), "MMM d, yyyy • h:mm a")}
                                   </span>
                                </div>
                                <p className="text-foreground font-medium line-clamp-2 md:line-clamp-1">{apt.reason || "Routine Checkup"}</p>
                             </div>
                             <Link href={`/doctor/appointments/${apt._id}`}>
                                <Button size="sm" variant="outline" className="w-full md:w-auto rounded-xl">Review <ArrowRight className="ml-2 w-4 h-4" /></Button>
                             </Link>
                          </CardContent>
                        </Card>
                     ))}
                  </div>
                )}
              </TabsContent>

              {/* Prescriptions Tab */}
              <TabsContent value="prescriptions" className="mt-0 outline-none">
                {prescriptions.length === 0 ? (
                  <Card className="border-dashed border-2 border-border/50 bg-background/50 shadow-none flex flex-col items-center py-16 text-center rounded-3xl mt-4">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground font-medium text-lg">No prescriptions issued yet.</p>
                  </Card>
                ) : (
                  <div className="grid gap-4 mt-4">
                    {prescriptions.map((presc) => (
                      <Card key={presc._id} className="hover:shadow-md transition-shadow border-border/50 bg-card/60 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute left-0 top-0 w-1.5 h-full bg-orange-400" />
                        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 pl-7">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <span className="font-extrabold text-foreground flex items-center gap-2">
                                 <FileText className="h-5 w-5 text-orange-500" /> Digital Rx
                              </span>
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-none">
                                {presc.medicines.length} Medication(s)
                              </Badge>
                              <span className="text-sm font-semibold text-muted-foreground">
                                {format(new Date(presc.date), "MMMM d, yyyy")}
                              </span>
                            </div>
                            
                            {presc.diagnosis.length > 0 && (
                              <div className="mt-3 flex gap-2 text-sm text-foreground">
                                <span className="font-bold shrink-0 text-muted-foreground">Dx:</span>
                                <span className="truncate font-medium bg-muted/50 px-2 rounded-md">{presc.diagnosis.join(", ")}</span>
                              </div>
                            )}
                          </div>
                          <Link href={`/patient/prescriptions/${presc._id}`}>
                             <Button size="sm" variant="secondary" className="w-full md:w-auto rounded-xl shadow-sm">View Document <ArrowRight className="ml-2 w-4 h-4" /></Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Eye Records Tab */}
              <TabsContent value="records" className="mt-0 outline-none">
                {eyeRecords.length === 0 ? (
                  <Card className="border-dashed border-2 border-border/50 bg-background/50 shadow-none flex flex-col items-center py-16 text-center rounded-3xl mt-4">
                    <Eye className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground font-medium text-lg">No AI scan records found.</p>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {eyeRecords.map((record) => (
                      <Card key={record._id} className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          {record.aiAnalysis && (
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                   <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Detected Issue</p>
                                   <h3 className="font-bold text-foreground text-lg line-clamp-1">
                                     {record.aiAnalysis.detectedCondition}
                                   </h3>
                                </div>
                                <Badge className={
                                  record.aiAnalysis.severity === "low" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                  record.aiAnalysis.severity === "moderate" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                  "bg-destructive/10 text-destructive border-destructive/20"
                                }>
                                  {record.aiAnalysis.severity} Alert
                                </Badge>
                              </div>

                              <div className="bg-muted/30 p-3 rounded-xl border border-border/40">
                                 <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-semibold text-muted-foreground">AI Confidence</span>
                                    <span className="text-sm font-bold text-foreground">{record.aiAnalysis.probability}%</span>
                                 </div>
                                 <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-full ${record.aiAnalysis.probability > 80 ? 'bg-emerald-500' : 'bg-primary'}`} style={{width: `${record.aiAnalysis.probability}%`}}/>
                                 </div>
                              </div>
                              
                              {record.aiAnalysis.notes && (
                                <p className="text-sm text-foreground font-medium bg-muted/20 p-3 rounded-lg border-l-2 border-primary">
                                  {record.aiAnalysis.notes}
                                </p>
                              )}
                              
                              <Separator className="bg-border/60" />
                              <div className="flex items-center text-xs font-semibold text-muted-foreground gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                Scanned: {format(new Date(record.createdAt), "MMM d, yyyy")}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
