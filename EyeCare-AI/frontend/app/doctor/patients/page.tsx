"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/authStore";
import { doctorApi } from "@/lib/api/doctor";
import { Loader2, Users, Search, ArrowRight, Mail, Phone, CalendarHeart } from "lucide-react";
import { motion } from "framer-motion";

interface PatientInfo {
  _id: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  email: string;
  appointmentCount: number;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function DoctorPatientsPage() {
  const { user } = useAuthStore();
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      if (user?._id) {
        try {
          const appointments = await doctorApi.getAppointments(user._id);
          
          // Extract unique patients from appointments
          const patientMap = new Map<string, PatientInfo>();
          
          appointments.forEach(apt => {
            if (typeof apt.patient === "object") {
              const patientId = apt.patient._id;
              if (patientMap.has(patientId)) {
                const existing = patientMap.get(patientId)!;
                existing.appointmentCount++;
              } else {
                patientMap.set(patientId, {
                  _id: apt.patient._id,
                  profile: apt.patient.profile,
                  email: apt.patient.email,
                  appointmentCount: 1,
                });
              }
            }
          });

          const uniquePatients = Array.from(patientMap.values());
          setPatients(uniquePatients);
          setFilteredPatients(uniquePatients);
        } catch (error) {
          console.error("Failed to fetch patients:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPatients();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = patients.filter(patient =>
        patient.profile.firstName.toLowerCase().includes(query) ||
        patient.profile.lastName.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query)
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-purple-500/10 blur-[130px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 flex-1 z-10 w-full max-w-7xl">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
               <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
                 <Users className="w-6 h-6" />
               </div>
               Patient Directory
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Direct access to patient profiles and medical records.</p>
          </div>
          
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl bg-muted/50 border-transparent focus-visible:border-purple-500 focus-visible:ring-purple-500/20 text-md shadow-sm"
            />
          </div>
        </div>

        {loading ? (
           <div className="flex justify-center flex-col items-center py-32">
             <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
             <p className="text-muted-foreground">Loading directory...</p>
           </div>
        ) : filteredPatients.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-dashed border-2 border-border/50 bg-background/50 shadow-none flex flex-col items-center justify-center p-16 text-center rounded-3xl mt-6">
              <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <Users className="h-12 w-12 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {searchQuery ? "No patients matching search" : "No patients in directory"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm text-lg">
                {searchQuery 
                  ? "Try adjusting your search terms."
                  : "Patients will automatically appear here once an appointment is scheduled."}
              </p>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {filteredPatients.map((patient) => (
              <motion.div variants={fadeIn} key={patient._id}>
                <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border/50 bg-card/60 backdrop-blur-md overflow-hidden group h-full flex flex-col">
                  {/* Top Color Banner */}
                  <div className="h-16 w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20" />
                  
                  <CardContent className="px-6 pb-6 pt-0 relative flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                       {/* Avatar overlapping border */}
                       <Avatar className="h-20 w-20 border-4 border-card bg-card shadow-sm -mt-10 rounded-2xl">
                         <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-2xl font-bold rounded-2xl">
                           {patient.profile.firstName[0]}{patient.profile.lastName[0]}
                         </AvatarFallback>
                       </Avatar>
                       
                       <div className="mt-3">
                         <div className="bg-muted/50 text-muted-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-border/50">
                           <CalendarHeart className="w-3 h-3" /> {patient.appointmentCount} Appts
                         </div>
                       </div>
                    </div>

                    <div className="mt-4 flex-1">
                      <h3 className="font-extrabold text-xl text-foreground line-clamp-1 group-hover:text-purple-500 transition-colors">
                        {patient.profile.firstName} {patient.profile.lastName}
                      </h3>
                      
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                             <Mail className="h-4 w-4 text-zinc-500" />
                          </div>
                          <span className="truncate">{patient.email}</span>
                        </div>
                        {patient.profile.phone && (
                          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                               <Phone className="h-4 w-4 text-zinc-500" />
                            </div>
                            <span>{patient.profile.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/50">
                      <Link href={`/doctor/patients/${patient._id}`} className="block w-full">
                        <Button variant="secondary" className="w-full rounded-xl hover:bg-purple-500 hover:text-white transition-colors group/btn">
                          View Health Record <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
