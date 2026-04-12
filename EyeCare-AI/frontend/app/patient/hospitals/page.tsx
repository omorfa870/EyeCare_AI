"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { commonApi } from "@/lib/api/common";
import { Hospital } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, MapPin, Building2, Phone, Globe, Navigation, Search, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const HospitalsMap = dynamic(
  () => import("@/components/HospitalsMap").then(m => m.HospitalsMap),
  { ssr: false, loading: () => (
    <div className="h-full w-full bg-muted/20 animate-pulse rounded-[2.5rem] flex flex-col items-center justify-center text-muted-foreground gap-4 border-2 border-dashed border-border/40">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      <p className="font-bold tracking-widest uppercase text-xs">Calibrating Geodata...</p>
    </div>
  )}
);

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function PatientHospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await commonApi.getHospitals();
        setHospitals(data);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleHospitalClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
  };

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full mix-blend-screen pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto max-w-7xl px-6 py-10 flex-1 z-10 w-full">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-10">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-black uppercase tracking-[0.2em] mb-4 border border-emerald-500/20">
                <Navigation className="w-3.5 h-3.5" /> Network Topology
              </div>
              <h1 className="text-4xl font-black tracking-tight text-foreground">Nearby Medical Centers</h1>
              <p className="text-muted-foreground mt-3 text-lg font-medium">
                Locate and audit integrated eye-care facilities closest to your current position.
              </p>
            </div>

            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by center name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-muted/50 border-transparent focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 text-md shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-40 text-muted-foreground">
              <div className="flex flex-col items-center gap-6">
                <Loader2 className="animate-spin h-12 w-12 text-emerald-500" />
                <p className="font-bold tracking-[0.3em] uppercase text-xs">Retrieving Facility Grid...</p>
              </div>
            </div>
          ) : hospitals.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
               <Card className="border-dashed border-2 border-border/40 bg-card/40 backdrop-blur-xl shadow-none flex flex-col items-center justify-center p-24 text-center rounded-4xl">
                  <div className="w-24 h-24 bg-muted/50 rounded-[2rem] flex items-center justify-center mb-8 border border-border/50">
                    <Building2 className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground mb-3">Grid Expansion Pending</h3>
                  <p className="text-muted-foreground text-lg font-medium max-w-sm mx-auto">
                    The EyeCare-AI medical network is currently scaling. Please verify connectivity later.
                  </p>
                </Card>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              {/* Main Map Bento Container */}
              <motion.div variants={fadeIn} className="lg:col-span-8 h-full">
                <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden group h-full flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-emerald-400 to-primary/60 z-20" />
                  <CardHeader className="border-b border-border/40 bg-muted/20 px-8 py-6 shrink-0">
                    <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
                      <div className="p-2 bg-emerald-500/20 text-emerald-600 rounded-xl">
                        <MapPin className="h-5 w-5" />
                      </div>
                      Real-time Spatial Overlay
                    </CardTitle>
                    <CardDescription className="font-medium">
                      {selectedHospital
                        ? <span className="text-emerald-600 font-bold">Showing: {selectedHospital.name}</span>
                        : "Click a facility in the list to highlight its location on the map."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 relative overflow-hidden">
                    <div className="absolute inset-0 z-0">
                      <HospitalsMap
                        hospitals={filteredHospitals}
                        selectedHospital={selectedHospital}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* List Side Panel Bento */}
              <motion.div variants={fadeIn} className="lg:col-span-4 h-full">
                <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-xl h-full flex flex-col rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="border-b border-border/40 bg-muted/20 px-8 py-6 shrink-0">
                    <CardTitle className="text-xl font-black tracking-tight">Audited Directory</CardTitle>
                    <CardDescription className="font-medium">{filteredHospitals.length} validated facilities found.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 flex-1 overflow-y-auto max-h-[600px] scrollbar-thin">
                    <div className="space-y-4 px-2">
                       <AnimatePresence mode="popLayout">
                        {filteredHospitals.map(h => {
                          const isSelected = selectedHospital?._id === h._id;
                          return (
                            <motion.div
                              layout
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              key={h._id}
                              onClick={() => handleHospitalClick(h)}
                              className={`rounded-3xl border p-5 transition-all cursor-pointer group ${
                                isSelected
                                  ? "border-emerald-500/60 bg-emerald-500/10 shadow-md shadow-emerald-500/10"
                                  : "border-border/60 bg-background/40 hover:border-emerald-500/40 hover:bg-emerald-500/5"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <h4 className={`font-black text-lg leading-tight transition-colors ${isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-foreground group-hover:text-emerald-600"}`}>
                                  {h.name}
                                </h4>
                                <Badge className={`border-none px-2 py-0.5 rounded-lg shrink-0 ${isSelected ? "bg-emerald-500 text-white" : "bg-emerald-500/10 text-emerald-600"}`}>
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> {isSelected ? "Selected" : "Active"}
                                </Badge>
                              </div>

                              <div className="flex items-start gap-2.5 text-sm font-medium text-muted-foreground mb-4">
                                <Globe className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${isSelected ? "text-emerald-500" : "text-zinc-400 group-hover:text-emerald-500"}`} />
                                <p className="line-clamp-2">
                                  {h.address?.street}, {h.address?.city}, {h.address?.state} {h.address?.zipCode}
                                </p>
                              </div>

                              {h.contactPhone && (
                                <div className={`flex items-center gap-2.5 text-sm text-foreground font-extrabold p-3 rounded-2xl border transition-all ${isSelected ? "bg-emerald-500/20 border-emerald-500/30" : "bg-muted/50 border-border/40 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20"}`}>
                                  <Phone className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                                  {h.contactPhone}
                                </div>
                              )}

                              {isSelected && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> Location shown on map
                                </p>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                  <div className="p-6 border-t border-border/40 bg-muted/10 shrink-0">
                     <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] text-center italic">EyeCare-AI Verified Nodes</p>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
