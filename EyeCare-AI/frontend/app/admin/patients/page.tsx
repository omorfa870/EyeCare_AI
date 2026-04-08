"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { adminApi } from "@/lib/api/admin";
import { Patient } from "@/lib/types";
import { 
  Loader2, 
  Search, 
  Users, 
  Mail, 
  Phone, 
  Trash2, 
  UserSquare2, 
  CalendarDays,
  Droplets,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function ManagePatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await adminApi.getAllPatients();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = patients.filter(patient => {
        const user = typeof patient.user === "object" ? patient.user : null;
        return (
          user?.profile?.firstName.toLowerCase().includes(query) ||
          user?.profile?.lastName.toLowerCase().includes(query) ||
          user?.email?.toLowerCase().includes(query)
        );
      });
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const handleDelete = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminApi.deleteUser(userId);
      await fetchPatients();
      setDeleteDialog(null);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 flex-1 z-10 w-full">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
               <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                 <Users className="w-8 h-8" />
               </div>
               User Directory
            </h1>
            <p className="text-muted-foreground mt-3 text-lg font-medium">Global database of registered patient identities.</p>
          </div>
          
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-muted/50 border-transparent focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 text-md shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center flex-col items-center py-32 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mb-4" />
            <p className="font-bold tracking-widest uppercase text-xs">Accessing Records...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-dashed border-2 border-border/40 bg-transparent py-24 text-center rounded-[3rem] mt-6">
              <Users className="h-20 w-20 text-muted-foreground/20 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-foreground mb-2">Registry Exhausted</h3>
              <p className="text-muted-foreground text-lg font-medium max-w-sm mx-auto">
                {searchQuery ? `No identities matching "${searchQuery}" found in the network.` : "No patients have been registered yet."}
              </p>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 pb-10">
            {filteredPatients.map((patient) => {
              const user = typeof patient.user === "object" ? patient.user : null;
              if (!user) return null;

              return (
                <motion.div variants={fadeIn} key={patient._id}>
                  <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden rounded-[2rem] h-full flex flex-col relative">
                    <div className="absolute right-0 top-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                       <UserSquare2 className="w-32 h-32" />
                    </div>
                    
                    <CardContent className="p-8 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex items-center gap-5">
                          <Avatar className="h-16 w-16 border-4 border-background shadow-lg rounded-2xl group-hover:rotate-3 transition-transform">
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/40 text-emerald-600 font-black text-xl rounded-2xl uppercase">
                              {user.profile?.firstName[0]}{user.profile?.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-extrabold text-2xl text-foreground tracking-tight line-clamp-1 group-hover:text-emerald-500 transition-colors">
                              {user.profile?.firstName} {user.profile?.lastName}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                               <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-2 py-0.5">Patient Account</Badge>
                               <span className="text-xs text-muted-foreground font-bold">ID: {patient._id.slice(-6).toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteDialog(user?._id)}
                          disabled={actionLoading === user?._id}
                          className="rounded-xl h-12 w-12 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                        >
                          {actionLoading === user?._id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        <div className="space-y-4">
                           <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground bg-muted/30 p-4 rounded-2xl border border-border/40">
                              <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm border border-border/50">
                                 <Mail className="h-4 w-4 text-emerald-500" />
                              </div>
                              <span className="truncate group-hover:text-foreground transition-colors">{user?.email}</span>
                           </div>
                           
                           {user?.profile.phone && (
                             <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground bg-muted/30 p-4 rounded-2xl border border-border/40">
                                <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm border border-border/50">
                                   <Phone className="h-4 w-4 text-emerald-500" />
                                </div>
                                <span className="group-hover:text-foreground transition-colors">{user?.profile.phone}</span>
                             </div>
                           )}
                        </div>

                        <div className="space-y-3 p-2">
                           {patient.gender && (
                             <div className="flex items-center justify-between text-sm py-1 border-b border-border/40">
                                <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Gender</span>
                                <span className="text-foreground font-extrabold capitalize">{patient.gender}</span>
                             </div>
                           )}
                           {patient.dateOfBirth && (
                             <div className="flex items-center justify-between text-sm py-1 border-b border-border/40">
                                <div className="flex items-center gap-2">
                                   <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
                                   <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Born</span>
                                </div>
                                <span className="text-foreground font-extrabold">{new Date(patient.dateOfBirth).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                             </div>
                           )}
                           {patient.bloodGroup && (
                             <div className="flex items-center justify-between text-sm py-1 border-b border-border/40">
                                <div className="flex items-center gap-2">
                                   <Droplets className="w-3.5 h-3.5 text-red-500" />
                                   <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Blood</span>
                                </div>
                                <span className="text-red-500 dark:text-red-400 font-extrabold">{patient.bloodGroup}</span>
                             </div>
                           )}
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-4 flex justify-end">
                         <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                            Verified Identity <ArrowRight className="w-3 h-3" />
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent className="rounded-[2.5rem] bg-card/95 backdrop-blur-2xl border-border/50 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
               <ShieldCheck className="w-8 h-8 text-destructive" /> Security Override
            </AlertDialogTitle>
            <AlertDialogDescription className="text-md font-medium text-muted-foreground pt-4 leading-relaxed">
              You are about to permanently purge this patient record and all associated diagnostic data from the secure network. This protocol is **irreversible**.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6 gap-3">
            <AlertDialogCancel className="rounded-2xl font-bold h-12 border-border/60">Abort Mission</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-2xl font-bold h-12 px-8 shadow-lg shadow-destructive/20"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Purge'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

