"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/api/admin";
import { Hospital } from "@/lib/types";
import { 
  Loader2, 
  MapPin, 
  Plus, 
  Trash2, 
  Phone, 
  Building2, 
  Globe, 
  Navigation,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Bangladesh",
    latitude: "",
    longitude: "",
    contactPhone: "",
  });

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getHospitals();
      setHospitals(data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await adminApi.createHospital({
        name: form.name,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country,
        },
        location: {
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        },
        contactPhone: form.contactPhone || "",
      });

      setForm({
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Bangladesh",
        latitude: "",
        longitude: "",
        contactPhone: "",
      });

      setSuccess("Hospital successfully registered in the network.");
      setTimeout(() => setSuccess(""), 5000);
      await fetchHospitals();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to create hospital");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this hospital from the secure network?")) return;
    try {
      await adminApi.deleteHospital(id);
      setHospitals(prev => prev.filter(h => h._id !== id));
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to delete hospital");
    }
  };

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[150px] rounded-full mix-blend-screen pointer-events-none -z-10 translate-x-1/4" />

      <div className="container mx-auto px-6 py-10 flex-1 z-10 w-full max-w-6xl">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-10">
          
          <motion.div variants={fadeIn} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4">
                 <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl">
                   <Building2 className="w-8 h-8" />
                 </div>
                 Center Registrar
              </h1>
              <p className="text-muted-foreground mt-3 text-lg font-medium">Manage and audit physical medical facilities within the network.</p>
            </div>
          </motion.div>

          {/* Grid for Form and List */}
          <div className="grid lg:grid-cols-5 gap-8">
            
            {/* Create form col-2 */}
            <motion.div variants={fadeIn} className="lg:col-span-2">
              <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden sticky top-24">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-amber-500" />
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <Plus className="w-6 h-6 text-orange-500" /> Register Facility
                  </CardTitle>
                  <CardDescription className="text-sm font-medium">Onboard a new medical center to the EyeCare-AI grid.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                   <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm flex items-center gap-3 font-bold overflow-hidden">
                        <AlertCircle className="h-5 w-5 shrink-0" /> {error}
                      </motion.div>
                    )}
                    {success && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-xl text-sm flex items-center gap-3 font-bold overflow-hidden">
                        <CheckCircle2 className="h-5 w-5 shrink-0" /> {success}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleCreate} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Facility Name</Label>
                      <Input
                        required
                        placeholder="e.g. Dhaka Eye Institute"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="h-12 rounded-xl bg-muted/30 border-transparent focus-visible:border-orange-500 focus-visible:ring-orange-500/10"
                      />
                    </div>

                    <div className="space-y-4">
                       <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Physical Location</Label>
                       <Input
                         required
                         placeholder="Street address"
                         value={form.street}
                         onChange={e => setForm({ ...form, street: e.target.value })}
                         className="h-12 rounded-xl bg-muted/30 border-transparent focus-visible:border-orange-500 focus-visible:ring-orange-500/10"
                       />
                       <div className="grid grid-cols-2 gap-3">
                         <Input
                           required
                           placeholder="City"
                           value={form.city}
                           onChange={e => setForm({ ...form, city: e.target.value })}
                           className="h-12 rounded-xl bg-muted/30 border-transparent focus-visible:border-orange-500 focus-visible:ring-orange-500/10"
                         />
                         <Input
                           required
                           placeholder="State/Province"
                           value={form.state}
                           onChange={e => setForm({ ...form, state: e.target.value })}
                           className="h-12 rounded-xl bg-muted/30 border-transparent focus-visible:border-orange-500 focus-visible:ring-orange-500/10"
                         />
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                         <Input
                           required
                           placeholder="Zip Code"
                           value={form.zipCode}
                           onChange={e => setForm({ ...form, zipCode: e.target.value })}
                           className="h-12 rounded-xl bg-muted/30 border-transparent focus-visible:border-orange-500 focus-visible:ring-orange-500/10"
                         />
                         <Input
                           placeholder="Country"
                           value={form.country}
                           onChange={e => setForm({ ...form, country: e.target.value })}
                           className="h-12 rounded-xl bg-muted/30 border-transparent focus-visible:border-orange-500 focus-visible:ring-orange-500/10"
                         />
                       </div>
                    </div>

                    <div className="space-y-4">
                       <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Geographic Coordinates</Label>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                             <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                             <Input
                               type="number"
                               step="0.000001"
                               required
                               placeholder="Latitude"
                               value={form.latitude}
                               onChange={e => setForm({ ...form, latitude: e.target.value })}
                               className="h-12 pl-10 rounded-xl bg-muted/30 border-transparent focus-visible:border-orange-500 focus-visible:ring-orange-500/10"
                             />
                          </div>
                          <div className="relative">
                             <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 rotate-90" />
                             <Input
                               type="number"
                               step="0.000001"
                               required
                               placeholder="Longitude"
                               value={form.longitude}
                               onChange={e => setForm({ ...form, longitude: e.target.value })}
                               className="h-12 pl-10 rounded-xl bg-muted/30 border-transparent focus-visible:border-orange-500 focus-visible:ring-orange-500/10"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Line</Label>
                      <Input
                        placeholder="e.g. +880 1234 567890"
                        value={form.contactPhone}
                        onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                        className="h-12 rounded-xl bg-muted/30 border-transparent focus-visible:border-orange-500 focus-visible:ring-orange-500/10"
                      />
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full h-14 rounded-2xl shadow-lg bg-primary text-primary-foreground font-black tracking-tight hover:scale-[1.02] transition-transform mt-4">
                      {submitting ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-foreground" /> Committing to Network...</>
                      ) : (
                        <><Plus className="mr-2 h-5 w-5 text-primary-foreground" /> Finalize Registration</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Hospital List col-3 */}
            <motion.div variants={fadeIn} className="lg:col-span-3 space-y-6">
              <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden min-h-[600px]">
                <CardHeader className="p-8 border-b border-border/40 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                         <MapPin className="h-6 w-6 text-orange-500" /> Authorized Centers
                      </CardTitle>
                      <CardDescription className="text-sm font-medium pt-1">Currently tracking {hospitals.length} audited facilities.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {loading ? (
                    <div className="flex flex-col justify-center items-center py-24 text-muted-foreground gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                      <p className="font-black uppercase tracking-widest text-xs">Accessing Grid...</p>
                    </div>
                  ) : hospitals.length === 0 ? (
                    <div className="py-24 text-center">
                       <MapPin className="h-20 w-20 text-muted-foreground/10 mx-auto mb-6" />
                       <p className="text-xl font-bold text-muted-foreground">The network registrar is currently empty.</p>
                       <p className="text-sm text-muted-foreground/60 mt-1">Begin by adding your first medical center.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hospitals.map(h => (
                        <div
                          key={h._id}
                          className="group flex items-start justify-between rounded-3xl border border-border/50 bg-muted/10 p-6 hover:bg-muted/30 transition-all hover:shadow-md"
                        >
                          <div className="flex items-start gap-5">
                             <div className="w-14 h-14 bg-background border border-border/50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                                <Building2 className="w-7 h-7" />
                             </div>
                             <div>
                                <h4 className="font-extrabold text-xl text-foreground mb-1 group-hover:text-orange-500 transition-colors">{h.name}</h4>
                                <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 mb-3 leading-relaxed max-w-md">
                                  <Globe className="w-3.5 h-3.5 shrink-0" />
                                  {h.address.street}, {h.address.city}, {h.address.state} {h.address.zipCode}, {h.address.country}
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-4">
                                   <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-orange-600 bg-orange-500/5 px-2 py-1 rounded-lg border border-orange-500/10">
                                      <Navigation className="w-3 h-3" /> {h.location.latitude} , {h.location.longitude}
                                   </div>
                                   {h.contactPhone && (
                                     <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg border border-border/40">
                                       <Phone className="h-3 w-3" />
                                       {h.contactPhone}
                                     </div>
                                   )}
                                </div>
                             </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(h._id)}
                            className="rounded-xl h-11 w-11 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

