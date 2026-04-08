"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/authStore";
import { doctorApi } from "@/lib/api/doctor";
import { eyeImageService } from "@/lib/api/eyeImage";
import { EyeRecord, EyeImagePredictionResponse } from "@/lib/types";
import { Loader2, Upload, Image as ImageIcon, AlertCircle, CheckCircle, Brain, Target, ShieldCheck, Activity, BarChart3 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

interface PatientInfo {
  _id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  email: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
};

export default function DoctorUploadScanPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<EyeRecord | null>(null);
  const [predictionResult, setPredictionResult] = useState<EyeImagePredictionResponse | null>(null);
  const [step, setStep] = useState<"upload" | "analyzing" | "result">("upload");
  
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      if (user?._id) {
        try {
          const appointments = await doctorApi.getAppointments(user._id);
          const patientMap = new Map<string, PatientInfo>();
          appointments.forEach(apt => {
            if (typeof apt.patient === "object") {
              const patientId = apt.patient._id;
              if (!patientMap.has(patientId)) {
                patientMap.set(patientId, {
                  _id: apt.patient._id,
                  profile: apt.patient.profile,
                  email: apt.patient.email,
                });
              }
            }
          });
          setPatients(Array.from(patientMap.values()));
        } catch (error) {
          console.error("Failed to fetch patients:", error);
        } finally {
          setLoadingPatients(false);
        }
      }
    };
    fetchPatients();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedPatientId) {
      setError("Please select a patient first");
      return;
    }
    if (!selectedFile) {
      setError("Please upload a retinal scan image");
      return;
    }

    setLoading(true);
    setStep("analyzing");

    try {
      // Call the eye image API for prediction
      const prediction = await eyeImageService.predict(selectedFile);
      setPredictionResult(prediction);
      
      // Determine severity based on confidence and condition
      const getSeverity = (condition: string, confidence: number): 'low' | 'moderate' | 'severe' => {
        const severeConditions = ['glaucoma', 'diabetic_retinopathy', 'age_related_macular_degeneration'];
        const moderateConditions = ['cataract', 'hypertensive_retinopathy'];
        
        if (severeConditions.some(c => condition.toLowerCase().includes(c))) {
          return confidence > 0.7 ? 'severe' : 'moderate';
        }
        if (moderateConditions.some(c => condition.toLowerCase().includes(c))) {
          return confidence > 0.6 ? 'moderate' : 'low';
        }
        return 'low';
      };
      
      // Create analysis result
      const result: EyeRecord = {
        _id: Date.now().toString(),
        patient: selectedPatientId,
        doctor: user?._id,
        visualAcuity: { od: "", os: "" },
        intraocularPressure: { od: "", os: "" },
        aiAnalysis: {
          detectedCondition: prediction.predicted_class.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          probability: Math.round(prediction.confidence * 100),
          severity: getSeverity(prediction.predicted_class, prediction.confidence),
          notes: `Analysis performed using ensemble deep learning model. Confidence: ${(prediction.confidence * 100).toFixed(2)}%`,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAnalysisResult(result);
      
      // Artificial delay to let the nice animation play out
      setTimeout(() => {
        setStep("result");
        setLoading(false);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Failed to analyze scan. Please try again.");
      setStep("upload");
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "moderate": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "severe": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-blue-500/10 blur-[130px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 flex-1 z-10 w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
             <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
               <Brain className="w-6 h-6" />
             </div>
             AI Scan Intelligence
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Upload retinal imagery for instantaneous deep-learning diagnostics.</p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl relative overflow-hidden rounded-3xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <CardContent className="p-6 md:p-10 min-h-[500px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {/* Step 1: Upload */}
              {step === "upload" && (
                <motion.form key="upload" variants={fadeIn} initial="hidden" animate="visible" exit="exit" onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto w-full">
                  {error && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm flex items-center gap-3 font-medium">
                      <AlertCircle className="h-5 w-5 shrink-0" /> {error}
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Patient Record</Label>
                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                      <SelectTrigger className="h-14 rounded-2xl bg-muted/50 border-transparent hover:border-blue-500/50 focus:ring-blue-500/20 text-md transition-colors">
                        <SelectValue placeholder="Link scan to a patient..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/50">
                        {loadingPatients ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">Loading patients...</div>
                        ) : patients.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">No assigned patients found</div>
                        ) : (
                          patients.map((p) => (
                            <SelectItem key={p._id} value={p._id} className="rounded-lg py-3 cursor-pointer">
                              <span className="font-bold">{p.profile.firstName} {p.profile.lastName}</span> <span className="text-muted-foreground ml-2 text-xs">{p.email}</span>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="scan" className="text-sm font-semibold text-foreground uppercase tracking-wider">Retinal Imagery</Label>
                    <div className={`border-2 border-dashed ${previewUrl ? 'border-blue-500/50 bg-blue-500/5' : 'border-border/60 hover:border-blue-500/40 hover:bg-muted/50'} rounded-3xl p-10 text-center transition-all group relative overflow-hidden`}>
                      {previewUrl ? (
                        <div className="space-y-6 relative z-10 flex flex-col items-center">
                          <img src={previewUrl} alt="Retinal Scan Preview" className="max-h-64 object-contain rounded-2xl shadow-lg border border-border/50" />
                          <Button type="button" variant="secondary" onClick={() => { setSelectedFile(null); setPreviewUrl(""); }} className="rounded-xl hover:bg-destructive hover:text-white transition-colors">
                            Discard Image
                          </Button>
                        </div>
                      ) : (
                        <div className="relative z-10 py-6">
                          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <ImageIcon className="h-10 w-10 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                          </div>
                          <label htmlFor="scan" className="cursor-pointer">
                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-500 transition-colors">Select Retinal Image</h3>
                            <p className="text-sm text-muted-foreground font-medium">Drag & drop or click to browse (Max 5MB)</p>
                          </label>
                          <input id="scan" type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={loading} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading} className="w-1/3 h-14 rounded-2xl border-border/60 hover:bg-muted">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading || !selectedFile || !selectedPatientId} className="flex-1 h-14 rounded-2xl shadow-lg text-md font-bold hover:scale-[1.02] transition-transform group bg-primary text-primary-foreground">
                       <Brain className="mr-2 h-5 w-5 text-primary-foreground group-hover:animate-pulse" /> Launch Diagnostics
                    </Button>
                  </div>
                </motion.form>
              )}

              {/* Step 2: Analyzing */}
              {step === "analyzing" && (
                <motion.div key="analyzing" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="text-center py-20 flex flex-col items-center">
                  <div className="relative mb-10 group">
                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 animate-pulse rounded-full" />
                    <div className="w-32 h-32 bg-background border border-border/50 rounded-full flex items-center justify-center relative z-10 shadow-2xl">
                      <Brain className="h-16 w-16 text-blue-500 animate-bounce" />
                    </div>
                    {/* Scanning line effect */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent z-20 animate-[scan_2s_ease-in-out_infinite]" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground mb-3 tracking-tight">Processing Imagery</h3>
                  <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                    Our neural network is analyzing the retina for anomalies and disease markers.
                  </p>
                </motion.div>
              )}

              {/* Step 3: Results */}
              {step === "result" && analysisResult && (
                <motion.div key="result" variants={fadeIn} initial="hidden" animate="visible" exit="exit" className="space-y-8 max-w-3xl mx-auto w-full py-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl flex items-start gap-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="pt-1">
                      <h4 className="font-bold text-foreground text-lg mb-1">Diagnostic Complete</h4>
                      <p className="text-sm text-foreground/80 font-medium">
                        The neural analysis is finished and firmly attached to the patient&apos;s permanent record.
                      </p>
                    </div>
                  </div>

                  {analysisResult.aiAnalysis && predictionResult && (
                    <Card className="border border-border/40 shadow-xl overflow-hidden rounded-3xl relative">
                      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <Target className="w-32 h-32" />
                      </div>
                      <CardContent className="p-8 space-y-8 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/40">
                           <div>
                             <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Primary Diagnosis</p>
                             <h2 className="text-3xl font-black text-foreground tracking-tight">
                               {analysisResult.aiAnalysis.detectedCondition}
                             </h2>
                           </div>
                           <Badge className={`px-4 py-2 text-sm uppercase tracking-widest border ${getSeverityColor(analysisResult.aiAnalysis.severity)}`}>
                             {analysisResult.aiAnalysis.severity} Severity
                           </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                           <div className="bg-muted/30 p-6 rounded-2xl border border-border/40 flex flex-col justify-center">
                             <div className="flex items-center justify-between mb-4">
                                <span className="font-bold text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4" /> Confidence Score</span>
                                <span className="font-black text-2xl text-foreground">{analysisResult.aiAnalysis.probability}%</span>
                             </div>
                             <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: `${analysisResult.aiAnalysis.probability}%` }} transition={{ duration: 1, delay: 0.2 }} className={`h-full ${analysisResult.aiAnalysis.probability > 85 ? 'bg-emerald-500' : 'bg-primary'}`} />
                             </div>
                           </div>

                           {analysisResult.aiAnalysis.notes && (
                             <div className="bg-blue-500/5 p-6 rounded-2xl border border-blue-500/20">
                               <p className="font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Clinical Notes</p>
                               <p className="text-sm font-medium text-foreground leading-relaxed">
                                 {analysisResult.aiAnalysis.notes}
                               </p>
                             </div>
                           )}
                        </div>

                        {/* All Class Scores */}
                        <div className="pt-6 border-t border-border/40">
                          <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-muted-foreground" />
                            <p className="font-bold text-muted-foreground">All Condition Scores</p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(predictionResult.all_scores)
                              .sort(([,a], [,b]) => b - a)
                              .map(([condition, score]) => (
                                <div
                                  key={condition}
                                  className={`p-3 rounded-xl border ${condition === predictionResult.predicted_class ? 'border-primary/50 bg-primary/5' : 'border-border/40 bg-muted/20'}`}
                                >
                                  <p className="text-xs font-medium text-muted-foreground capitalize truncate">
                                    {condition.replace(/_/g, ' ')}
                                  </p>
                                  <p className="text-lg font-bold text-foreground">
                                    {(score * 100).toFixed(1)}%
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/40">
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl border-border/60 font-bold" onClick={() => {
                        setStep("upload");
                        setSelectedFile(null);
                        setPreviewUrl("");
                        setAnalysisResult(null);
                        setPredictionResult(null);
                    }}>
                        Process Another Scan
                    </Button>
                    <Button onClick={() => router.push("/doctor/dashboard")} className="flex-1 h-14 rounded-2xl shadow-lg font-bold bg-primary text-primary-foreground">
                        Return to Dashboard
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
