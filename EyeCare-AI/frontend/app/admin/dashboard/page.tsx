"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { adminApi, AdminStats } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCog,
  Activity,
  MapPin,
  Loader2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await adminApi.getStats();
        setStats(s);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 w-full flex justify-center items-center py-32 text-muted-foreground bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full mix-blend-screen pointer-events-none -z-10" />
        <div className="flex flex-col items-center gap-4 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="font-semibold tracking-wide">Initializing secure oversight panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-background flex flex-col relative overflow-hidden">
      {/* Background Decorative Elemets */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full mix-blend-screen pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10 -translate-x-1/4 translate-y-1/4" />

      <div className="container mx-auto px-6 py-10 flex-1 z-10">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-10">
          
          <motion.div variants={fadeIn} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4 border border-primary/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Core Security Operations
              </div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                System Overview
              </h1>
              <p className="text-muted-foreground mt-2 text-lg font-medium">
                Global statistics and management controls for the EyeCare-AI network.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/hospitals">
                 <Button className="rounded-xl shadow-lg border-2 border-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6">
                   <Plus className="mr-2 h-4 w-4 text-primary-foreground" /> Add Medical Center
                 </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Bento Grid */}
          <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden rounded-[2rem]">
               <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-100 transition-opacity translate-x-4 -translate-y-4">
                  <UserCog className="w-32 h-32 text-primary" />
               </div>
               <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-2.5 bg-primary/10 rounded-xl">
                        <UserCog className="w-6 h-6 text-primary" />
                     </div>
                     <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Medical Officers</span>
                  </div>
                  <h3 className="text-5xl font-black text-foreground mb-1">
                     {stats?.counts?.totalDoctors ?? 0}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 pt-2">
                     <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Authorized Practitioners
                  </p>
               </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden rounded-[2rem]">
               <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-100 transition-opacity translate-x-4 -translate-y-4">
                  <Users className="w-32 h-32 text-emerald-500" />
               </div>
               <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                        <Users className="w-6 h-6 text-emerald-500" />
                     </div>
                     <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Global Patients</span>
                  </div>
                  <h3 className="text-5xl font-black text-foreground mb-1">
                     {stats?.counts?.totalPatients ?? 0}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 pt-2">
                     <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Registered Identities
                  </p>
               </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden rounded-[2rem]">
               <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-100 transition-opacity translate-x-4 -translate-y-4">
                  <Activity className="w-32 h-32 text-orange-500" />
               </div>
               <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-2.5 bg-orange-500/10 rounded-xl">
                        <Activity className="w-6 h-6 text-orange-500" />
                     </div>
                     <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Network Activity</span>
                  </div>
                  <h3 className="text-5xl font-black text-foreground mb-1 truncate">
                     ${stats?.counts?.estimatedRevenue ?? 0}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 pt-2">
                     Estimated Total Value
                  </p>
               </CardContent>
            </Card>
          </motion.div>

          {/* Quick Access Actions */}
          <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/doctors">
              <Card className="border-border/50 bg-card/60 rounded-3xl hover:bg-muted/50 transition-colors shadow-sm group">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform">
                      <UserCog className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">Manage Doctors</h4>
                      <p className="text-sm text-muted-foreground">Verify & audit practitioners</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/patients">
              <Card className="border-border/50 bg-card/60 rounded-3xl hover:bg-muted/50 transition-colors shadow-sm group">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                      <Users className="w-7 h-7 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">Manage Patients</h4>
                      <p className="text-sm text-muted-foreground">Oversight of user identities</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/hospitals">
              <Card className="border-border/50 bg-card/60 rounded-3xl hover:bg-muted/50 transition-colors shadow-sm group">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-orange-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                      <MapPin className="w-7 h-7 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">Audit Centers</h4>
                      <p className="text-sm text-muted-foreground">Hospital & Facility records</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Activity Section */}
          <div className="grid lg:grid-cols-1 gap-8">
            <motion.div variants={fadeIn}>
              <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black">Recent Secure Identifiers</CardTitle>
                      <CardDescription className="text-md font-medium">Newest users registered in the network.</CardDescription>
                    </div>
                    <Link href="/admin/doctors">
                      <Button variant="ghost" className="rounded-xl font-bold hover:bg-primary/10 hover:text-primary transition-all">
                        Audit Directory <ExternalLink className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="px-8 py-4">
                  {(!stats?.recentActivity?.newUsers || stats.recentActivity.newUsers.length === 0) ? (
                    <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-4">
                       <Users className="w-16 h-16 opacity-10" />
                       <p className="font-bold text-xl opacity-40 uppercase tracking-widest">No Recent Activity Detected</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {stats.recentActivity.newUsers.slice(0, 5).map((u) => (
                        <div
                          key={u._id}
                          className="flex items-center justify-between py-6 group hover:px-4 hover:bg-muted/20 transition-all rounded-2xl"
                        >
                          <div className="flex items-center gap-5">
                            <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-black text-xl">
                                {u.profile.firstName[0]}{u.profile.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xl font-extrabold text-foreground tracking-tight underline-offset-4 group-hover:underline">
                                {u.profile.firstName} {u.profile.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground font-medium">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <Badge className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.1em] border transition-colors ${
                               u.role === "doctor" ? "bg-primary/10 text-primary border-primary/20" :
                               u.role === "patient" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                               "bg-muted text-muted-foreground border-border"
                             }`}>
                               {u.role}
                             </Badge>
                             <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                          </div>
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

