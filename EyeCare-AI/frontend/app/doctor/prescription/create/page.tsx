"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/lib/store/authStore";
import { doctorApi } from "@/lib/api/doctor";
import { Loader2, Plus, X, CheckCircle, Stethoscope, Activity, ClipboardList, Pill, User, CalendarDays, ArrowLeft, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MedicineItem {
  medicine: string; 
  medicineName: string;
  brandName: string;
  genericName: string;
  strength: string;
  form: "Tablet" | "Capsule" | "Syrup" | "Drop" | "Injection" | "Ointment";
  dosage: string;
  duration: string;
  instruction: string;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function CreatePrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, roleData } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    vitals: { bp: "", weight: "", temperature: "" },
    symptoms: [""],
    diagnosis: [""],
    medicines: [] as MedicineItem[],
    advice: "",
    followUpDate: "",
  });

  const appointmentId = searchParams.get("appointmentId");
  const patientId = searchParams.get("patientId");

  const addField = (field: "symptoms" | "diagnosis") => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeField = (field: "symptoms" | "diagnosis", index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray.length > 0 ? newArray : [""] });
  };

  const updateField = (field: "symptoms" | "diagnosis", index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addMedicine = () => {
    const newMedicine: MedicineItem = {
      medicine: "", medicineName: "", brandName: "", genericName: "",
      strength: "", form: "Tablet", dosage: "", duration: "", instruction: "",
    };
    setFormData({ ...formData, medicines: [...formData.medicines, newMedicine] });
  };

  const removeMedicine = (index: number) => {
    setFormData({ ...formData, medicines: formData.medicines.filter((_, i) => i !== index) });
  };

  const updateMedicine = (index: number, field: keyof MedicineItem, value: string) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    
    if (["brandName", "genericName", "strength"].includes(field)) {
      const med = newMedicines[index];
      newMedicines[index].medicineName = `${med.brandName} (${med.genericName}) - ${med.strength}`;
    }
    
    setFormData({ ...formData, medicines: newMedicines });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!patientId || !roleData?._id) {
        setError("Missing patient or doctor session data. Please try again.");
        setLoading(false);
        return;
      }

      const symptoms = formData.symptoms.filter(s => s.trim() !== "");
      const diagnosis = formData.diagnosis.filter(d => d.trim() !== "");

      if (symptoms.length === 0 || diagnosis.length === 0) {
        setError("Please add at least one valid symptom and diagnosis.");
        setLoading(false);
        return;
      }

      if (formData.medicines.length === 0) {
        setError("Please prescribe at least one medicine.");
        setLoading(false);
        return;
      }

      const invalidMedicine = formData.medicines.find(
        m => !m.brandName || !m.genericName || !m.strength || !m.dosage || !m.duration
      );
      if (invalidMedicine) {
        setError("Please fill all required fields (*) for the listed medicines.");
        setLoading(false);
        return;
      }

      const prescriptionData = {
        appointmentId: appointmentId || undefined,
        doctorId: user!._id,
        patientId,
        vitals: formData.vitals,
        symptoms,
        diagnosis,
        medicines: formData.medicines,
        advice: formData.advice,
        followUpDate: formData.followUpDate || undefined,
      };

      await doctorApi.createPrescription(prescriptionData);
      setSuccess(true);
      setTimeout(() => {
        if (appointmentId) router.push(`/doctor/appointments/${appointmentId}`);
        else router.push("/doctor/patients");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create prescription");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 w-full bg-background flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full mix-blend-screen pointer-events-none -z-10" />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
           <CheckCircle className="h-24 w-24 text-emerald-500 mx-auto mb-6 drop-shadow-lg" />
           <h2 className="text-3xl font-black text-foreground mb-3">Prescription Issued!</h2>
           <p className="text-muted-foreground text-lg">Safely redirecting you to your schedule...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 flex-1 z-10 w-full">

        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
             <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl">
               <Stethoscope className="w-6 h-6" />
             </div>
             Digital Prescription Builder
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Author official prescriptions linked securely to patient records.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm flex items-center gap-3 font-medium overflow-hidden">
                 <X className="h-5 w-5 shrink-0" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
            
            {/* Section 1: Vitals */}
            <motion.div variants={fadeIn}>
              <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden rounded-3xl">
                <div className="bg-gradient-to-r from-muted/50 to-muted/20 border-b border-border/50 p-4 px-6 flex items-center gap-3">
                  <Activity className="text-orange-500 w-5 h-5" />
                  <h3 className="font-bold text-foreground text-lg tracking-tight">Patient Vitals</h3>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Blood Pressure</Label>
                      <Input placeholder="120/80" value={formData.vitals.bp} onChange={(e) => setFormData({...formData, vitals: { ...formData.vitals, bp: e.target.value }})} disabled={loading} className="h-12 rounded-xl bg-muted/50 border-transparent focus-visible:border-orange-500/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Weight (kg)</Label>
                      <Input placeholder="70" value={formData.vitals.weight} onChange={(e) => setFormData({...formData, vitals: { ...formData.vitals, weight: e.target.value }})} disabled={loading} className="h-12 rounded-xl bg-muted/50 border-transparent focus-visible:border-orange-500/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Temperature (°F)</Label>
                      <Input placeholder="98.6" value={formData.vitals.temperature} onChange={(e) => setFormData({...formData, vitals: { ...formData.vitals, temperature: e.target.value }})} disabled={loading} className="h-12 rounded-xl bg-muted/50 border-transparent focus-visible:border-orange-500/50" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Section 2: Clinical Assessment */}
            <motion.div variants={fadeIn}>
              <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden rounded-3xl">
                <div className="bg-gradient-to-r from-muted/50 to-muted/20 border-b border-border/50 p-4 px-6 flex items-center gap-3">
                  <ClipboardList className="text-orange-500 w-5 h-5" />
                  <h3 className="font-bold text-foreground text-lg tracking-tight">Clinical Assessment</h3>
                </div>
                <CardContent className="p-6 space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold text-foreground">Symptoms Tracker</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addField("symptoms")} className="rounded-xl border-dashed h-8 px-3 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/30">
                        <Plus className="h-4 w-4 mr-1" /> Add Symptom
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      {formData.symptoms.map((symptom, index) => (
                        <div key={index} className="flex gap-3 group relative items-center">
                          <Input placeholder="E.g., Blurred vision, throbbing headache..." value={symptom} onChange={(e) => updateField("symptoms", index, e.target.value)} disabled={loading} className="h-12 rounded-xl flex-1 border-border/60 bg-background focus-visible:border-orange-500/50 shadow-sm" />
                          {formData.symptoms.length > 1 && (
                            <Button type="button" variant="ghost" onClick={() => removeField("symptoms", index)} className="w-12 h-12 rounded-xl bg-destructive/5 text-destructive hover:bg-destructive/20 shrink-0">
                              <X className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold text-foreground">Primary Diagnosis</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addField("diagnosis")} className="rounded-xl border-dashed h-8 px-3 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/30">
                        <Plus className="h-4 w-4 mr-1" /> Add Diagnosis
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      {formData.diagnosis.map((diag, index) => (
                        <div key={index} className="flex gap-3 group relative items-center">
                          <Input placeholder="E.g., Acute Viral Conjunctivitis" value={diag} onChange={(e) => updateField("diagnosis", index, e.target.value)} disabled={loading} className="h-12 rounded-xl flex-1 border-border/60 bg-background focus-visible:border-orange-500/50 shadow-sm" />
                          {formData.diagnosis.length > 1 && (
                            <Button type="button" variant="ghost" onClick={() => removeField("diagnosis", index)} className="w-12 h-12 rounded-xl bg-destructive/5 text-destructive hover:bg-destructive/20 shrink-0">
                              <X className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Section 3: Medication */}
            <motion.div variants={fadeIn}>
              <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden rounded-3xl">
                <div className="bg-gradient-to-r from-orange-500/10 to-transparent border-b border-border/50 p-4 px-6 flex items-center gap-3">
                  <Pill className="text-orange-500 w-5 h-5" />
                  <h3 className="font-bold text-foreground text-lg tracking-tight">Prescribed Medication</h3>
                  <Button type="button" variant="secondary" size="sm" onClick={addMedicine} className="ml-auto rounded-xl shadow-sm hover:bg-orange-500 hover:text-white transition-colors">
                     <Plus className="h-4 w-4 mr-1" /> Add Medicine
                  </Button>
                </div>
                <CardContent className="p-6">
                  {formData.medicines.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border/60 rounded-2xl bg-muted/20">
                      <Pill className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium mb-4">No medication added to this prescription.</p>
                      <Button type="button" onClick={addMedicine} className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md">
                        <Plus className="h-4 w-4 mr-2" /> Add First Medicine
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {formData.medicines.map((med, index) => (
                        <div key={index} className="relative bg-background border border-border/60 rounded-2xl p-6 shadow-sm group">
                          <div className="absolute top-4 right-4 z-10">
                             <Button type="button" variant="ghost" onClick={() => removeMedicine(index)} className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors shrink-0 p-0 flex items-center justify-center">
                               <X className="h-4 w-4" />
                             </Button>
                          </div>
                          <div className="flex items-center gap-2 mb-6">
                             <div className="bg-orange-500/10 text-orange-500 font-bold w-7 h-7 flex items-center justify-center rounded-lg text-xs">{(index + 1).toString().padStart(2, '0')}</div>
                             <h4 className="font-bold text-foreground">Medication Config.</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <div className="space-y-1.5">
                              <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Brand Name *</Label>
                              <Input placeholder="E.g., Vigamox" value={med.brandName} onChange={(e) => updateMedicine(index, "brandName", e.target.value)} required className="h-11 rounded-xl bg-muted/30 focus-visible:bg-background" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Generic Name *</Label>
                              <Input placeholder="E.g., Moxifloxacin" value={med.genericName} onChange={(e) => updateMedicine(index, "genericName", e.target.value)} required className="h-11 rounded-xl bg-muted/30 focus-visible:bg-background" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
                            <div className="space-y-1.5 md:col-span-1">
                              <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Strength *</Label>
                              <Input placeholder="0.5%" value={med.strength} onChange={(e) => updateMedicine(index, "strength", e.target.value)} required className="h-11 rounded-xl bg-muted/30 focus-visible:bg-background" />
                            </div>
                            <div className="space-y-1.5 md:col-span-1">
                              <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Form *</Label>
                              <Select value={med.form} onValueChange={(val: any) => updateMedicine(index, "form", val)}>
                                <SelectTrigger className="h-11 rounded-xl bg-muted/30 focus:ring-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  {["Tablet", "Capsule", "Syrup", "Drop", "Injection", "Ointment"].map((f) => (
                                    <SelectItem key={f} value={f}>{f}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5 md:col-span-1">
                              <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Dosage *</Label>
                              <Input placeholder="1 drop 3x a day" value={med.dosage} onChange={(e) => updateMedicine(index, "dosage", e.target.value)} required className="h-11 rounded-xl bg-muted/30 focus-visible:bg-background" />
                            </div>
                            <div className="space-y-1.5 md:col-span-1">
                              <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Duration *</Label>
                              <Input placeholder="7 Days" value={med.duration} onChange={(e) => updateMedicine(index, "duration", e.target.value)} required className="h-11 rounded-xl bg-muted/30 focus-visible:bg-background" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                             <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Special Instructions</Label>
                             <Input placeholder="E.g., Apply strictly before sleeping" value={med.instruction} onChange={(e) => updateMedicine(index, "instruction", e.target.value)} className="h-11 rounded-xl bg-muted/30 focus-visible:bg-background border-dashed" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Section 4: Output / Post */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <motion.div variants={fadeIn}>
                 <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden rounded-3xl h-full">
                    <CardContent className="p-6 h-full flex flex-col">
                      <Label className="text-base font-semibold text-foreground mb-3 flex items-center gap-2"><User className="w-4 h-4 text-orange-500" /> Advice & Remarks</Label>
                      <Textarea placeholder="Any lifestyle recommendations, diet changes, or warnings..." value={formData.advice} onChange={(e) => setFormData({ ...formData, advice: e.target.value })} disabled={loading} className="flex-1 min-h-[120px] rounded-xl border-border/60 bg-muted/30 resize-none font-medium leading-relaxed" />
                    </CardContent>
                 </Card>
               </motion.div>

               <motion.div variants={fadeIn}>
                 <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden rounded-3xl h-full">
                    <CardContent className="p-6 h-full flex flex-col justify-center">
                      <Label className="text-base font-semibold text-foreground mb-3 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-orange-500" /> Next Follow-up (Optional)</Label>
                      <Input type="date" value={formData.followUpDate} onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })} disabled={loading} className="h-14 rounded-xl border-border/60 bg-muted/30 text-lg font-semibold px-4 cursor-pointer" />
                      <p className="text-sm text-muted-foreground mt-4 font-medium">Selecting a date will notify the patient to book a specific targeted follow-up session.</p>
                    </CardContent>
                 </Card>
               </motion.div>
            </div>

          </motion.div>

          {/* Master Submit */}
          <motion.div variants={fadeIn} className="pt-8 pb-10 flex flex-col sm:flex-row gap-4 border-t border-border/40">
             <Button type="submit" disabled={loading} className="h-16 flex-1 rounded-2xl shadow-xl text-lg font-bold hover:scale-[1.01] transition-transform bg-primary hover:bg-primary/90 text-primary-foreground">
               {loading ? (
                 <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Transmitting Prescription...</>
               ) : (
                 <><Send className="mr-3 h-5 w-5 text-primary-foreground" /> Issue Digital Prescription</>
               )}
             </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
