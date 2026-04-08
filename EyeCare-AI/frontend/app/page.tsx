"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  Stethoscope,
  Shield,
  MapIcon,
  ArrowRight,
  CheckCircle2,
  Search,
  Settings,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-border/40">
        {/* Dynamic Background Ether - Multi-layered */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[160px] rounded-full mix-blend-screen pointer-events-none -z-10 animate-pulse-slow" />
        <div className="absolute top-40 left-10 w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full -z-10 pointer-events-none opacity-60" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24"
          >
            {/* Left Content Column */}
            <div className="flex-1 text-center lg:text-left space-y-8">
              <motion.div
                variants={fadeIn}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm backdrop-blur-md"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-background bg-zinc-200 dark:bg-zinc-800"
                    />
                  ))}
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-primary italic">
                  Trusted by 10k+ Patients and Doctors Worldwide
                </p>
              </motion.div>

              <motion.h1
                variants={fadeIn}
                className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] text-foreground"
              >
                Intelligent Vision. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-emerald-500">
                  Trusted Care.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className="text-xl md:text-2xl text-muted-foreground/80 font-medium max-w-xl leading-relaxed mx-auto lg:mx-0"
              >
                Revolutionizing eye health through deep-learning analysis and seamless connectivity with expert ophthalmologists.
              </motion.p>

              <motion.div
                variants={fadeIn}
                className="flex flex-col sm:flex-row gap-5 pt-4 justify-center lg:justify-start"
              >
                <Link href="/register?role=patient" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-2xl text-lg h-16 px-10 shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all bg-primary text-primary-foreground font-black tracking-tight group"
                  >
                    Begin Diagnosis
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/register?role=doctor" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-2xl text-lg h-16 px-10 border-2 font-bold hover:bg-muted/50 transition-all shadow-sm"
                  >
                    Continue as Doctor
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Mockup Column */}
            <motion.div
              variants={fadeIn}
              className="flex-1 w-full max-w-2xl relative perspective-1000"
            >
              {/* Floating AI Analysis Chips */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -left-10 z-30 bg-card/40 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Retina Status
                    </p>
                    <p className="text-sm font-black text-foreground">Healthy Pattern</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -right-8 z-30 bg-card/40 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Confidence Index
                    </p>
                    <p className="text-sm font-black text-foreground">99.42% Match</p>
                  </div>
                </div>
              </motion.div>

              {/* Main Floating Mockup */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 0.5, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-20"
              >
                {/* Global Glow around mockup */}
                <div className="absolute -inset-4 bg-primary/20 blur-[60px] rounded-[3rem] -z-10 opacity-60" />

                {/* Premium macOS-style Frame */}
                <div className="rounded-[2.5rem] p-3 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
                  {/* Diagnostic Header */}
                  <div className="flex items-center justify-between px-6 py-4 bg-black/5 dark:bg-white/5 border-b border-white/10 rounded-t-3xl">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-black/10 dark:bg-white/10 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                        Live Analysis
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground/40">
                      <Search className="w-3.5 h-3.5" />
                      <Settings className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-950 overflow-hidden rounded-3xl m-2">
                    <Image
                      src="/images/hero-eye-scan.jpeg"
                      alt="EyeCare-AI Command Center"
                      fill
                      className="object-cover transition-transform duration-700"
                      priority
                    />

                    {/* Interactive Focus Ring */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-dashed border-primary/60 rounded-full z-10"
                    />

                    {/* Vertical Scanning Blade */}
                    <motion.div
                      animate={{ top: ["-10%", "110%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 w-full h-16 bg-gradient-to-b from-transparent via-primary/30 to-transparent pointer-events-none z-20 flex items-center"
                    >
                      <div className="w-full h-[1px] bg-primary brightness-150" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Decorative elements behind floating window */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -z-10" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -z-10" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Metric Stats Bar */}
      <section className="relative z-20 -mt-12 mb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          data-magnifiable
          className="max-w-6xl mx-auto bg-card/60 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-black/5 flex flex-wrap justify-center md:justify-between items-center gap-12 text-center md:text-left"
        >
          <div className="flex items-center gap-5 group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-4xl font-black text-foreground tracking-tighter">92.0%</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                Detection Accuracy
              </p>
            </div>
          </div>

          <div className="w-px h-12 bg-border/50 hidden lg:block" />

          <div className="flex items-center gap-5 group">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-4xl font-black text-foreground tracking-tighter">24/7</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                System Availability
              </p>
            </div>
          </div>

          <div className="w-px h-12 bg-border/50 hidden lg:block" />

          <div className="flex items-center gap-5 group">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-4xl font-black text-foreground tracking-tighter">500+</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                Certified Doctors
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">Why EyeCare-AI?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A seamless blend of advanced artificial intelligence and professional human expertise to protect your vision.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto auto-rows-[250px]"
          >
            {/* Feature 1 - Patient */}
            <motion.div variants={fadeIn} className="md:col-span-1">
              <Card className="h-full border border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/50 transition-colors group overflow-hidden">
                <CardContent className="p-8 h-full flex flex-col justify-end relative">
                  {/* <div className="absolute top-8 right-8 bg-blue-500/10 p-4 rounded-full group-hover:scale-110 transition-transform">
                    <Zap className="h-8 w-8 text-blue-500" />
                  </div> */}
                  <h3 className="text-2xl font-bold mb-3">AI Symptom Analysis for Patients</h3>
                  <p className="text-muted-foreground max-w-md">
                    Enter your symptoms and receive fast, clinically informed preliminary insights in seconds through our medically-trained AI system.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 2 - Doctor */}
            <motion.div variants={fadeIn} className="md:col-span-1">
              <Card className="h-full border border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/50 transition-colors group overflow-hidden">
                <CardContent className="p-8 h-full flex flex-col justify-end relative">
                  {/* <div className="absolute top-8 right-8 bg-primary/10 p-4 rounded-full group-hover:scale-110 transition-transform">
                    <Stethoscope className="h-8 w-8 text-primary" />
                  </div> */}
                  <h3 className="text-2xl font-bold mb-3">Fundus Image Analysis for Doctors</h3>
                  <p className="text-muted-foreground max-w-md">
                    Upload fundus eye images and obtain highly accurate preliminary analysis in seconds with our medically-trained AI detection system.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeIn}>
              <Card className="h-full border border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/50 transition-colors group relative overflow-hidden">
                <CardContent className="p-8 h-full flex flex-col justify-end text-right">
                  <div className="absolute top-8 left-8 bg-purple-500/10 p-4 rounded-full group-hover:scale-110 transition-transform">
                    <Stethoscope className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Expert Doctors</h3>
                  <p className="text-muted-foreground text-sm">
                    Consult with top certified ophthalmologists directly through secure remote video or chat.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={fadeIn}>
              <Card className="h-full border border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/50 transition-colors group relative overflow-hidden">
                <CardContent className="p-8 h-full flex flex-col justify-end">
                  <div className="absolute top-8 right-8 bg-emerald-500/10 p-4 rounded-full group-hover:scale-110 transition-transform">
                    <Shield className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Secure & Private</h3>
                  <p className="text-muted-foreground text-sm">
                    End-to-end encrypted medical data storage meeting strict HIPAA compliance protocols.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 5 - Medium spanning */}
            <motion.div variants={fadeIn} className="md:col-span-2">
              <Card className="h-full border border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/50 transition-colors group relative overflow-hidden">
                <CardContent className="p-8 h-full flex flex-col justify-end relative">
                  <div className="absolute top-8 right-8 bg-orange-500/10 p-4 rounded-full group-hover:scale-110 transition-transform">
                    <MapIcon className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Map Service</h3>
                  <p className="text-muted-foreground max-w-sm">
                    A built-in map service designed to help you instantly locate and navigate to the nearest top-rated eye care hospitals in your vicinity.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Stacked Cards */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to comprehensive eye care.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <motion.div
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] ring-1 ring-border shadow-lg">
                <Image
                  src="/images/step-ai-analysis.jpg"
                  alt="AI analysis"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 text-primary rounded-xl w-10 h-10 flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <h3 className="text-xl font-bold">Get AI Analysis</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Users can receive instant AI-powered analysis and preliminary results by uploading symptoms or scans.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-6"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] ring-1 ring-border shadow-lg">
                <Image
                  src="/images/step-eye-scan.jpg"
                  alt="Upload scan"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 text-primary rounded-xl w-10 h-10 flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <h3 className="text-xl font-bold">Reliable Scans</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Doctors can safely upload fundus images and obtain reliable predictions through our platform.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-6"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] ring-1 ring-border shadow-lg">
                <Image
                  src="/images/step-consultation.jpg"
                  alt="Consultation"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 text-primary rounded-xl w-10 h-10 flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <h3 className="text-xl font-bold">Consult Doctor</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Book an appointment and get expert medical advice instantly tailored to your results.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Large Glowing CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/20 blur-[120px] -z-10 rounded-full" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-card border border-border/50 shadow-2xl rounded-3xl p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
            Ready to Protect Your Vision?
          </h2>
          <p className="text-muted-foreground text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of users leveraging AI to stay ahead of eye diseases. Creating an account takes less than a minute.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="rounded-xl h-14 px-10 text-lg shadow-xl hover:scale-105 transition-transform"
            >
              Create Free Account
            </Button>
          </Link>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
}