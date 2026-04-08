"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/authStore";
import { Eye, EyeOff, Loader2, ArrowLeft, Stethoscope, ShieldCheck, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const initialRole =
    (searchParams.get("role") as "patient" | "doctor" | "admin") || "patient";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: initialRole,
    specialization: "",
    registrationNumber: "",
  });

  useEffect(() => {
    const role =
      (searchParams.get("role") as "patient" | "doctor" | "admin") || "patient";

    setFormData((prev) => ({
      ...prev,
      role,
    }));
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(`/${user.role}/dashboard`);
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.role === "doctor") {
      if (!formData.specialization.trim() || !formData.registrationNumber.trim()) {
        setError("Specialization and Registration Number are required for doctors");
        return;
      }
    }

    setLoading(true);

    try {
      const { confirmPassword, ...raw } = formData;

      const registerData: any = {
        email: raw.email,
        password: raw.password,
        role: raw.role,
        firstName: raw.firstName,
        lastName: raw.lastName,
      };

      if (raw.role === "doctor") {
        registerData.specialization = raw.specialization;
        registerData.registrationNumber = raw.registrationNumber;
      }

      const response = await authApi.register(registerData);
      setAuth(response.user, response.token, response.roleData);

      if (response.user.role === "patient") {
        router.push("/patient/setup");
      } else if (response.user.role === "doctor") {
        router.push("/doctor/setup");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const setRole = (role: "patient" | "doctor" | "admin") => {
    setFormData((prev) => ({ ...prev, role }));
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <div className="hidden lg:flex w-1/2 relative bg-zinc-950 overflow-hidden items-center justify-center">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/20 blur-[130px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/20 blur-[100px] rounded-full mix-blend-screen" />

        <div className="relative z-10 p-12 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Logo className="mb-8 scale-125 origin-left" />
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              Join the Vanguard of Digital Health.
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Create an account instantly and gain access to the most advanced AI-powered eye care ecosystem in the world.
            </p>

            <div className="flex items-center gap-6 mt-12">
              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-emerald-400">10k+</h4>
                <p className="text-zinc-500 text-sm">Active Patients</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-blue-400">500+</h4>
                <p className="text-zinc-500 text-sm">Certified Experts</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col bg-background h-screen overflow-y-auto relative scrollbar-none">
        <div className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 lg:px-12 py-4 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-start px-6 lg:px-12 py-12">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full mx-0"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Create an account</h2>
              <p className="text-muted-foreground">Select your role and enter your details to get started.</p>
            </div>

            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl border border-destructive/20"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-3 pb-2">
                    <Label>I am registering as a...</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("patient")}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
                          formData.role === "patient"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/30 bg-card hover:bg-muted text-muted-foreground"
                        )}
                      >
                        <User className="h-6 w-6" />
                        <span className="text-sm font-semibold">Patient</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole("doctor")}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
                          formData.role === "doctor"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/30 bg-card hover:bg-muted text-muted-foreground"
                        )}
                      >
                        <Stethoscope className="h-6 w-6" />
                        <span className="text-sm font-semibold">Doctor</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole("admin")}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
                          formData.role === "admin"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/30 bg-card hover:bg-muted text-muted-foreground"
                        )}
                      >
                        <ShieldCheck className="h-6 w-6" />
                        <span className="text-sm font-semibold">Admin</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Omor"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        disabled={loading}
                        className="h-12 px-4 rounded-xl bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Faruq"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        disabled={loading}
                        className="h-12 px-4 rounded-xl bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-colors"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {formData.role === "doctor" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input
                            id="specialization"
                            placeholder="Ophthalmologist"
                            value={formData.specialization}
                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                            required
                            disabled={loading}
                            className="h-12 px-4 rounded-xl bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="registrationNumber">Registration Number</Label>
                          <Input
                            id="registrationNumber"
                            placeholder="BMDC-XXXX"
                            value={formData.registrationNumber}
                            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                            required
                            disabled={loading}
                            className="h-12 px-4 rounded-xl bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-colors"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={loading}
                      className="h-12 px-4 rounded-xl bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          disabled={loading}
                          className="h-12 px-4 pr-10 rounded-xl bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 w-full">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        disabled={loading}
                        className="h-12 px-4 rounded-xl bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-colors"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-xl text-md mt-4" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <div className="text-center pt-4 text-muted-foreground border-t border-border/50">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-medium hover:underline">
                      Sign In
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}