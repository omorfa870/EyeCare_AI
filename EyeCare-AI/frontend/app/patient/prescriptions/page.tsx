"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthHeader } from "@/components/AuthHeader";
import { useAuthStore } from "@/lib/store/authStore";
import { patientApi } from "@/lib/api/patient";
import { Prescription } from "@/lib/types";
import { Loader2, FileText, Calendar, User, ArrowRight, Pill } from "lucide-react";
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

export default function PatientPrescriptionsPage() {
  const { user } = useAuthStore();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (user?._id) {
        try {
          const data = await patientApi.getPrescriptions(user._id);
          // Sort newest first
          const sorted = data.sort((a,b) => +new Date(b.date) - +new Date(a.date));
          setPrescriptions(sorted);
        } catch (error: any) {
          console.error("Failed to fetch prescriptions:", error);
          setError(error.response?.data?.message || "Failed to load prescriptions");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [user]);

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      {/* Soft abstract glows */}
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-orange-500/10 blur-[130px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 flex-1 z-10">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Medical Records</h1>
            <p className="text-muted-foreground mt-1 text-lg">Access and download your digital prescriptions.</p>
          </div>

          {loading ? (
             <div className="flex justify-center items-center py-32 text-muted-foreground">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
                  <p>Loading medical records...</p>
                </div>
              </div>
          ) : error ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-destructive/20 bg-destructive/5 shadow-none flex flex-col items-center justify-center p-12 text-center rounded-3xl">
                <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Unable to load records
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  {error}
                </p>
              </Card>
            </motion.div>
          ) : prescriptions.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-dashed border-2 border-border/50 bg-background shadow-none flex flex-col items-center justify-center p-12 text-center rounded-3xl">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  No prescriptions found
                </h3>
                <p className="text-muted-foreground mb-8 max-w-sm">
                  Digital prescriptions will appear here once an EyeCare-AI doctor issues them after a consultation.
                </p>
                <Link href="/patient/book-appointment">
                  <Button size="lg" className="rounded-xl px-8 shadow-xl shadow-primary/20">Book a Consultation</Button>
                </Link>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {prescriptions.map((prescription) => {
                const doctor = typeof prescription.doctor === "object" ? prescription.doctor : null;
                return (
                  <motion.div variants={fadeIn} key={prescription._id}>
                    <Card className="h-full border border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-lg hover:border-primary/30 transition-all group flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                      
                      <CardContent className="pt-6 p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
                              <FileText className="h-5 w-5" />
                            </div>
                            <Badge variant="outline" className="border-border bg-background shadow-sm flex items-center gap-1.5 px-3 py-1 text-xs">
                              <Pill className="h-3 w-3 text-muted-foreground" />
                              {prescription.medicines.length} Medicine(s)
                            </Badge>
                          </div>

                          <div className="space-y-3">
                             <div>
                                <h3 className="font-bold text-xl text-foreground">
                                  {format(new Date(prescription.date), "MMMM d, yyyy")}
                                </h3>
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mt-1">
                                  <User className="h-4 w-4" />
                                  <span>
                                    Dr. {doctor ? `${doctor.profile.firstName} ${doctor.profile.lastName}` : "Specialist"}
                                  </span>
                                </div>
                             </div>

                             {prescription.diagnosis && prescription.diagnosis.length > 0 && (
                                <div className="bg-muted/40 p-3 rounded-xl mt-4 border border-border/30">
                                   <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Diagnosis</p>
                                   <p className="text-sm text-foreground font-medium">
                                     {prescription.diagnosis.join(", ")}
                                   </p>
                                </div>
                             )}
                          </div>
                        </div>

                        <div className="pt-6 mt-4 border-t border-border/50">
                          <Link href={`/patient/prescriptions/${prescription._id}`} className="w-full">
                            <Button variant="ghost" className="w-full justify-between rounded-xl group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                              View Digital Document
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </Link>
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
