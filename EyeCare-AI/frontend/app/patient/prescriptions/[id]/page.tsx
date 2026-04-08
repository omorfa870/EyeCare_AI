"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { patientApi } from "@/lib/api/patient";
import { Prescription } from "@/lib/types";
import { 
  Loader2, 
  Calendar, 
  User, 
  FileText, 
  AlertCircle, 
  ArrowLeft, 
  Printer, 
  HeartPulse, 
  Activity, 
  Thermometer, 
  Pill, 
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Info,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function PrescriptionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const data = await patientApi.getPrescriptionById(params.id as string);
        setPrescription(data);
      } catch (error: any) {
        console.error("Failed to fetch prescription:", error);
        setError(error.response?.data?.message || "Failed to load prescription");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPrescription();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex-1 w-full flex justify-center items-center py-32 text-muted-foreground bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full mix-blend-screen pointer-events-none -z-10" />
        <div className="flex flex-col items-center gap-4 z-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-bold tracking-widest uppercase text-xs">Authenticating Secure Document...</p>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="flex-1 w-full bg-background relative overflow-hidden h-full flex items-center justify-center p-6">
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-destructive/10 blur-[130px] rounded-full mix-blend-screen pointer-events-none -z-10" />
        <Card className="border-destructive/20 bg-card/40 backdrop-blur-xl shadow-none flex flex-col items-center justify-center p-12 text-center rounded-[2.5rem] w-full max-w-md">
          <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mb-6 border border-destructive/20">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h3 className="text-2xl font-black text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground mb-8 font-medium">The document you requested is either restricted or does not exist in our secure cloud.</p>
          <Button onClick={() => router.back()} className="rounded-2xl px-8 h-12 font-bold shadow-lg bg-primary text-primary-foreground">
            Return to Directory
          </Button>
        </Card>
      </div>
    );
  }

  const doctor = typeof prescription.doctor === "object" ? prescription.doctor : null;

  return (
    <div className="flex-1 w-full bg-background relative overflow-hidden min-h-screen">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 max-w-5xl flex-1 z-10 relative">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()} 
          className="mb-8 -ml-3 text-muted-foreground hover:text-foreground hover:bg-muted font-bold transition-all rounded-xl px-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
        </Button>

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
          
          <motion.div variants={fadeIn}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden rounded-[3rem] print:shadow-none print:border-none">
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-emerald-500 to-indigo-500" />
              
              <CardHeader className="md:px-14 md:pt-14 pb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Health Record
                  </div>
                  <CardTitle className="text-4xl md:text-5xl font-black flex items-center gap-4 text-foreground tracking-tighter">
                    <div className="p-4 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20">
                      <FileText className="h-8 w-8" />
                    </div>
                    Digital Prescription
                  </CardTitle>
                  <CardDescription className="text-lg flex items-center gap-2.5 font-bold text-muted-foreground/80">
                    <Calendar className="w-5 h-5 text-primary" />
                    {format(new Date(prescription.date), "EEEE, MMMM d, yyyy")}
                  </CardDescription>
                </div>
                <Button onClick={() => window.print()} className="rounded-2xl bg-primary text-primary-foreground shadow-xl hover:scale-105 active:scale-95 transition-all gap-2 print:hidden h-14 px-8 font-black tracking-tight">
                  <Printer className="w-5 h-5 text-primary-foreground" /> Generate Paper Copy
                </Button>
              </CardHeader>
              
              <CardContent className="md:px-14 pb-14 space-y-12">
                
                {/* Information Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                   {/* Doctor Identity */}
                  <div className="bg-muted/30 border border-border/50 p-8 rounded-[2rem] flex items-center gap-6 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                       <Stethoscope className="w-24 h-24" />
                    </div>
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-foreground/20 text-white rounded-3xl flex items-center justify-center font-black text-3xl shadow-xl border-4 border-background shrink-0">
                      {doctor?.profile.firstName?.[0] || "D"}{doctor?.profile.lastName?.[0] || "R"}
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Prescribing Physician</p>
                       <h3 className="text-2xl font-black text-foreground tracking-tight">
                          Dr. {doctor ? `${doctor.profile.firstName} ${doctor.profile.lastName}` : "Specialist"}
                       </h3>
                       <p className="text-sm font-bold text-primary mt-1">EyeCare-AI Verified Partner</p>
                    </div>
                  </div>

                  {/* Patient Info Card Placeholder / Simplified */}
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2rem] flex items-center gap-6 group">
                     <div className="w-20 h-20 bg-background text-emerald-600 rounded-3xl flex items-center justify-center font-black text-3xl shadow-lg border-2 border-emerald-500/20 shrink-0">
                        <User className="w-10 h-10" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Authenticated Subject</p>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">Electronic Identity</h3>
                        <p className="text-sm font-medium text-muted-foreground mt-1 truncate">ID: {prescription._id.slice(-12).toUpperCase()}</p>
                     </div>
                  </div>
                </div>

                {/* Vitals Bento Grid */}
                {(prescription.vitals.bp || prescription.vitals.weight || prescription.vitals.temperature) && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-foreground flex items-center gap-3 uppercase tracking-tighter">
                      <Activity className="w-6 h-6 text-primary" /> Physiological Status
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {prescription.vitals.bp && (
                        <Card className="bg-background/40 backdrop-blur-sm border-border/50 p-6 rounded-[1.5rem] shadow-sm flex flex-col gap-4 group hover:border-rose-500/30 transition-colors">
                           <div className="flex items-center justify-between">
                              <div className="p-3 bg-rose-500/10 rounded-xl">
                                <HeartPulse className="w-6 h-6 text-rose-500" />
                              </div>
                              <span className="text-[10px] font-black text-muted-foreground/60 tracking-widest uppercase">mmHg</span>
                           </div>
                           <div>
                             <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Blood Pressure</p>
                             <p className="font-black text-foreground text-3xl tracking-tight">{prescription.vitals.bp}</p>
                           </div>
                        </Card>
                      )}
                      {prescription.vitals.weight && (
                        <Card className="bg-background/40 backdrop-blur-sm border-border/50 p-6 rounded-[1.5rem] shadow-sm flex flex-col gap-4 group hover:border-blue-500/30 transition-colors">
                           <div className="flex items-center justify-between">
                              <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Activity className="w-6 h-6 text-blue-500" />
                              </div>
                              <span className="text-[10px] font-black text-muted-foreground/60 tracking-widest uppercase">Kilograms</span>
                           </div>
                           <div>
                             <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Body Mass</p>
                             <p className="font-black text-foreground text-3xl tracking-tight">{prescription.vitals.weight}</p>
                           </div>
                        </Card>
                      )}
                      {prescription.vitals.temperature && (
                        <Card className="bg-background/40 backdrop-blur-sm border-border/50 p-6 rounded-[1.5rem] shadow-sm flex flex-col gap-4 group hover:border-orange-500/30 transition-colors">
                           <div className="flex items-center justify-between">
                              <div className="p-3 bg-orange-500/10 rounded-xl">
                                <Thermometer className="w-6 h-6 text-orange-500" />
                              </div>
                              <span className="text-[10px] font-black text-muted-foreground/60 tracking-widest uppercase">Fahrenheit</span>
                           </div>
                           <div>
                             <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Body Temp</p>
                             <p className="font-black text-foreground text-3xl tracking-tight">{prescription.vitals.temperature}</p>
                           </div>
                        </Card>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-10">
                  {/* Clinical Reports */}
                  {prescription.symptoms.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-foreground flex items-center gap-3 uppercase tracking-tighter">
                        <AlertCircle className="w-6 h-6 text-amber-500" /> Observations
                      </h3>
                      <div className="grid gap-3">
                        {prescription.symptoms.map((symptom, index) => (
                          <div key={index} className="flex items-center gap-4 text-foreground p-5 bg-muted/20 rounded-2xl border border-border/40 text-sm font-bold group hover:bg-muted/30 transition-all">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 group-hover:scale-125 transition-transform" />
                            {symptom}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prescription.diagnosis.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-foreground flex items-center gap-3 uppercase tracking-tighter">
                        <Sparkles className="w-6 h-6 text-purple-500" /> Final Diagnosis
                      </h3>
                      <div className="grid gap-3">
                        {prescription.diagnosis.map((diag, index) => (
                          <div key={index} className="flex items-center gap-4 text-foreground p-5 bg-purple-500/5 rounded-2xl border border-purple-500/20 text-sm font-black group hover:bg-purple-500/10 transition-all">
                            <div className="w-3 h-3 bg-purple-500 rounded-full shrink-0 group-hover:scale-125 transition-transform" />
                            {diag}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="bg-border/60" />

                {/* Pharmaceutical Directive */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-black text-foreground flex items-center gap-4 tracking-tighter uppercase">
                       <Pill className="w-8 h-8 text-emerald-500" /> Prescribed Medication
                     </h3>
                     <Badge className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-widest">
                        {prescription.medicines.length} Pharmaceutical Items
                     </Badge>
                  </div>
                  
                  <div className="grid gap-6">
                    {prescription.medicines.map((med, index) => (
                      <Card key={index} className="relative bg-background/50 border border-border/60 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                           <Pill className="w-40 h-40 -rotate-12" />
                        </div>
                        
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                           <div className="space-y-4 max-w-2xl">
                             <div>
                                <h4 className="font-black text-3xl text-foreground mb-1 tracking-tight group-hover:text-emerald-600 transition-colors">{med.brandName}</h4>
                                <div className="flex items-center gap-3">
                                   <p className="text-xs font-black text-muted-foreground uppercase tracking-wider bg-muted/80 px-3 py-1 rounded-lg">{med.genericName}</p>
                                   <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest border-emerald-500/20 text-emerald-600">Verified Drug</Badge>
                                </div>
                             </div>

                             <div className="flex flex-wrap gap-4 pt-2">
                                <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 flex items-center gap-3">
                                   <div className="p-2 bg-background rounded-xl border border-border/50">
                                      <Activity className="w-4 h-4 text-emerald-500" />
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Dosage Protocol</p>
                                      <p className="font-black text-foreground uppercase">{med.dosage}</p>
                                   </div>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 flex items-center gap-3">
                                   <div className="p-2 bg-background rounded-xl border border-border/50">
                                      <Clock className="w-4 h-4 text-emerald-500" />
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Treatment Period</p>
                                      <p className="font-black text-foreground uppercase">{med.duration}</p>
                                   </div>
                                </div>
                             </div>

                             {med.instruction && (
                               <div className="bg-orange-500/10 border-2 border-orange-500/20 p-5 rounded-2xl flex items-start gap-4">
                                  <Info className="w-5 h-5 text-orange-600 mt-1 shrink-0" />
                                  <div>
                                     <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Administrative Notes</p>
                                     <p className="text-foreground font-extrabold leading-relaxed">{med.instruction}</p>
                                  </div>
                               </div>
                             )}
                           </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator className="bg-border/60" />

                {/* Additional Directives */}
                <div className="grid md:grid-cols-2 gap-8">
                   {prescription.advice && (
                      <div className="bg-indigo-500/5 border border-indigo-500/20 p-8 rounded-[2.5rem] relative group">
                        <div className="absolute top-6 right-6">
                           <ShieldCheck className="w-8 h-8 text-indigo-500/20" />
                        </div>
                        <h3 className="text-xl font-black text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-3 uppercase tracking-tighter">
                           <FileText className="w-6 h-6" /> Physician's Counsel
                        </h3>
                        <p className="text-foreground leading-relaxed font-bold text-lg">
                          “{prescription.advice}”
                        </p>
                      </div>
                   )}

                   {prescription.followUpDate && (
                      <div className="bg-primary/5 border-2 border-primary/20 p-8 rounded-[2.5rem] flex flex-col justify-between group overflow-hidden relative">
                        <div className="absolute -bottom-6 -right-6 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                           <Calendar className="w-32 h-32" />
                        </div>
                        <div className="mb-6">
                           <h3 className="text-xl font-black text-primary mb-2 flex items-center gap-3 uppercase tracking-tighter">
                              <Calendar className="w-6 h-6" /> Re-evaluation
                           </h3>
                           <p className="text-muted-foreground font-bold text-sm">Please finalize the next clinical review session on or before:</p>
                        </div>
                        <div className="bg-background shadow-xl border-2 border-primary/20 p-6 rounded-2xl flex items-center gap-6 group-hover:scale-[1.02] transition-transform">
                          <div className="p-3 bg-primary text-primary-foreground rounded-xl">
                            <Clock className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Scheduled Threshold</p>
                            <p className="text-foreground font-black text-2xl tracking-tight">
                              {format(new Date(prescription.followUpDate), "MMMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      </div>
                   )}
                </div>

                <div className="pt-8 text-center border-t border-border/40">
                   <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.3em] opacity-40">EyeCare-AI Secure Digital Asset — End of Transmission</p>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

