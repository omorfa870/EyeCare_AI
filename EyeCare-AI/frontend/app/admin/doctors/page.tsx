"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Doctor } from "@/lib/types";
import { 
  Loader2, 
  Search, 
  UserCog, 
  Mail, 
  Phone, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  UserPlus, 
  Filter,
  ArrowRight,
  ShieldCheck,
  Stethoscope
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

export default function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await adminApi.getAllDoctors();
      setDoctors(data);
      setFilteredDoctors(data);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = doctors;

    if (activeTab === "active") {
      filtered = doctors.filter(doc => doc?.isActive === true);
    } else if (activeTab === "inactive") {
      filtered = doctors.filter(doc => doc?.isActive === false);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doctor => {
        const user = typeof doctor.user === "object" ? doctor.user : null;
        return (
          user?.profile.firstName.toLowerCase().includes(query) ||
          user?.profile.lastName.toLowerCase().includes(query) ||
          user?.email.toLowerCase().includes(query) ||
          doctor.specialization.toLowerCase().includes(query)
        );
      });
    }

    setFilteredDoctors(filtered);
  }, [searchQuery, doctors, activeTab]);

  const handleToggleStatus = async (doctorId: string, currentStatus: boolean) => {
    setActionLoading(doctorId);
    try {
      await adminApi.updateDoctorStatus({
        doctorId,
        isActive: !currentStatus,
      });
      await fetchDoctors();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminApi.deleteUser(userId);
      await fetchDoctors();
      setDeleteDialog(null);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const getActiveDoctorsCount = () => doctors.filter(doc => doc?.isActive === true).length;
  const getInactiveDoctorsCount = () => doctors.filter(doc => doc?.isActive === false).length;

  const renderDoctorCard = (doctor: Doctor) => {
    const user = typeof doctor.user === "object" ? doctor.user : null;
    if (!user) return null;

    return (
      <motion.div variants={fadeIn} key={doctor._id}>
        <Card className={`group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/60 backdrop-blur-md overflow-hidden rounded-3xl relative ${!doctor.isActive ? 'opacity-85 grayscale-[0.3]' : ''}`}>
          {/* Status color bar */}
          <div className={`absolute left-0 top-0 w-1.5 h-full ${doctor.isActive ? 'bg-emerald-500' : 'bg-destructive'}`} />
          
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <Avatar className="h-20 w-20 border-4 border-background shadow-lg rounded-2xl group-hover:rotate-3 transition-transform">
                  <AvatarFallback className={`text-2xl font-black rounded-2xl ${doctor.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                    {user.profile.firstName[0]}{user.profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                   <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-extrabold text-2xl text-foreground tracking-tight">
                        Dr. {user.profile.firstName} {user.profile.lastName}
                      </h3>
                      <Badge className={`px-2 py-0.5 text-[10px] uppercase font-black tracking-widest border transition-colors ${
                        doctor.isActive 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      }`}>
                        {doctor.isActive ? 'Verified' : 'Suspended'}
                      </Badge>
                   </div>
                   <div className="flex items-center gap-2 text-primary font-bold text-sm mb-3">
                      <Stethoscope className="w-4 h-4" /> {doctor.specialization}
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <Mail className="h-3.5 w-3.5 text-zinc-400" /> <span>{user.email}</span>
                      </div>
                      {user.profile.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                          <Phone className="h-3.5 w-3.5 text-zinc-400" /> <span>{user.profile.phone}</span>
                        </div>
                      )}
                   </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:self-center">
                 <div className="bg-muted/30 px-4 py-2 rounded-xl border border-border/50 text-xs font-semibold text-muted-foreground mb-2 lg:mb-0">
                    Reg: <span className="text-foreground ml-1">{doctor.registrationNumber}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={doctor.isActive ? "outline" : "default"}
                      onClick={() => handleToggleStatus(doctor._id, doctor.isActive)}
                      disabled={actionLoading === doctor._id}
                      className={`rounded-xl font-bold h-10 px-4 transition-all ${doctor.isActive ? 'border-border/60 hover:bg-destructive/5 hover:border-destructive/20 hover:text-destructive' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                    >
                      {actionLoading === doctor._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : doctor.isActive ? (
                        <><XCircle className="h-4 w-4 mr-2" /> Deactivate</>
                      ) : (
                        <><CheckCircle className="h-4 w-4 mr-2" /> Activate Account</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteDialog(user._id)}
                      disabled={actionLoading === doctor._id}
                      className="rounded-xl h-10 px-4 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap gap-2">
               {doctor.qualifications.map((q, i) => (
                 <Badge key={i} variant="secondary" className="bg-muted/50 text-muted-foreground border-transparent rounded-lg font-medium px-2 py-0">
                   {q}
                 </Badge>
               ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 flex-1 z-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
               <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                 <ShieldCheck className="w-8 h-8" />
               </div>
               Medical Officers
            </h1>
            <p className="text-muted-foreground mt-3 text-lg font-medium">Verify credentials and manage practitioner accessibility.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search name, email or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-muted/50 border-transparent focus-visible:border-primary focus-visible:ring-primary/20 text-md shadow-sm"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center flex-col items-center py-32 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="font-bold tracking-widest uppercase text-xs">Syncing Directory...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
               <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-auto border border-border/50">
                <TabsTrigger value="all" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold">
                  All <Badge variant="secondary" className="ml-2 bg-muted/50">{doctors.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="active" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold">
                  Active <Badge variant="secondary" className="ml-2 bg-emerald-500/10 text-emerald-500 border-none">{getActiveDoctorsCount()}</Badge>
                </TabsTrigger>
                <TabsTrigger value="inactive" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold">
                  Suspended <Badge variant="secondary" className="ml-2 bg-destructive/10 text-destructive border-none">{getInactiveDoctorsCount()}</Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab + searchQuery}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
               >
                 <TabsContent value="all" className="mt-0">
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-6">
                      {filteredDoctors.length === 0 ? (
                        <Card className="border-dashed border-2 border-border/40 bg-transparent py-20 text-center rounded-[2.5rem]">
                          <UserCog className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                          <p className="text-xl font-bold text-muted-foreground">
                            {searchQuery ? 'No practitioners matching "'+searchQuery+'"' : 'The directory is currently empty.'}
                          </p>
                        </Card>
                      ) : filteredDoctors.map(renderDoctorCard)}
                    </motion.div>
                 </TabsContent>

                 <TabsContent value="active" className="mt-0">
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-6">
                      {filteredDoctors.length === 0 ? (
                        <Card className="border-dashed border-2 border-border/40 bg-transparent py-20 text-center rounded-[2.5rem]">
                          <CheckCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                          <p className="text-xl font-bold text-muted-foreground">No active practitioners found.</p>
                        </Card>
                      ) : filteredDoctors.map(renderDoctorCard)}
                    </motion.div>
                 </TabsContent>

                 <TabsContent value="inactive" className="mt-0">
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-6">
                      {filteredDoctors.length === 0 ? (
                        <Card className="border-dashed border-2 border-border/40 bg-transparent py-20 text-center rounded-[2.5rem]">
                          <XCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                          <p className="text-xl font-bold text-muted-foreground">No suspended accounts detected.</p>
                        </Card>
                      ) : filteredDoctors.map(renderDoctorCard)}
                    </motion.div>
                 </TabsContent>
               </motion.div>
            </AnimatePresence>
          </Tabs>
        )}
      </div>

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent className="rounded-[2rem] border-border/50 bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black tracking-tight">Revoke Access Permanently?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              This action will completely scrub this practitioner's identity and records from the EyeCare-AI network. This operation is **irreversible**.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-0">
            <AlertDialogCancel className="rounded-xl font-bold">Abort</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-xl font-bold"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Deletion'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

