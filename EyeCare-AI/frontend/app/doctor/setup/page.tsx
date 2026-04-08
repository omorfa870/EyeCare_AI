"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/authStore";
import { doctorApi } from "@/lib/api/doctor";
import { Loader2, Plus, X, Stethoscope, ShieldCheck, Landmark, GraduationCap, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorSetupPage() {
  const router = useRouter();
  const { user, setAuth, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    specialization: "",
    registrationNumber: "",
    qualifications: [""],
  });

  const addQualification = () => {
    setFormData({
      ...formData,
      qualifications: [...formData.qualifications, ""],
    });
  };

  const removeQualification = (index: number) => {
    const newQualifications = formData.qualifications.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      qualifications: newQualifications.length > 0 ? newQualifications : [""],
    });
  };

  const updateQualification = (index: number, value: string) => {
    const newQualifications = [...formData.qualifications];
    newQualifications[index] = value;
    setFormData({
      ...formData,
      qualifications: newQualifications,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const qualifications = formData.qualifications.filter(q => q.trim() !== "");

      if (qualifications.length === 0) {
        setError("Please add at least one medical qualification.");
        setLoading(false);
        return;
      }

      const profileData = {
        user: user!._id,
        specialization: formData.specialization,
        registrationNumber: formData.registrationNumber,
        qualifications,
      };

      const response = await doctorApi.createProfile(profileData);

      if (user && token) {
        setAuth(user, token, response);
      }

      router.push("/doctor/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to finalize profile. Please verify your credentials.");
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/doctor/dashboard");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center py-12 px-6">
      {/* Dynamic Background */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-10">
           <div className="inline-flex p-4 bg-primary/10 rounded-3xl mb-6 shadow-sm border border-primary/20">
              <Stethoscope className="h-10 w-10 text-primary" />
           </div>
           <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">Professional Credentialing</h1>
           <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto">
             Verify your medical authority to unlock diagnostic tools and patient consultations.
           </p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-indigo-500 to-primary" />
          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-sm font-bold flex items-center gap-3"
                  >
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-8">
                {/* Specialization */}
                <motion.div variants={itemVariants} className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <Label htmlFor="specialization" className="text-sm font-black uppercase tracking-widest text-muted-foreground">Specialization Focus</Label>
                  </div>
                  <Input
                    id="specialization"
                    placeholder="e.g. Retinal Surgeon, Pediatric Ophthalmologist"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    required
                    disabled={loading}
                    className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:ring-primary/20 text-lg font-semibold px-6 transition-all"
                  />
                </motion.div>

                {/* Registration Number */}
                <motion.div variants={itemVariants} className="space-y-3">
                   <div className="flex items-center gap-2 mb-1">
                    <Landmark className="h-4 w-4 text-primary" />
                    <Label htmlFor="registrationNumber" className="text-sm font-black uppercase tracking-widest text-muted-foreground">Board Registration No.</Label>
                  </div>
                  <Input
                    id="registrationNumber"
                    placeholder="e.g. BMDC-X99201"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    required
                    disabled={loading}
                    className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:ring-primary/20 text-lg font-semibold px-6 transition-all"
                  />
                </motion.div>

                {/* Qualifications */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                       <GraduationCap className="h-4 w-4 text-primary" />
                       <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Education & Certs</Label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addQualification}
                      disabled={loading}
                      className="rounded-xl border-dashed border-2 text-xs font-bold hover:bg-primary/10 hover:text-primary transition-all px-4"
                    >
                      <Plus className="h-3 w-3 mr-1.5" />
                      Add Another
                    </Button>
                  </div>
                  
                  <div className="grid gap-3">
                    {formData.qualifications.map((qualification, index) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={index} 
                        className="flex gap-3"
                      >
                        <Input
                          placeholder="e.g. MBBS (DMC), FRCS (London)"
                          value={qualification}
                          onChange={(e) => updateQualification(index, e.target.value)}
                          disabled={loading}
                          className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:ring-primary/20 text-md font-medium px-6 transition-all flex-1"
                        />
                        {formData.qualifications.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQualification(index)}
                            disabled={loading}
                            className="h-14 w-14 rounded-2xl bg-muted/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform bg-primary text-primary-foreground"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" />
                      Finalizing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-primary-foreground">
                       Set Official Profile <ArrowRight className="h-5 w-5 ml-2 text-primary-foreground" />
                    </div>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={loading}
                  className="h-16 px-8 rounded-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <footer className="mt-12 text-muted-foreground text-sm font-medium flex items-center gap-2">
         <ShieldCheck className="h-4 w-4" /> Secure Verification System v2.0
      </footer>
    </div>
  );
}
