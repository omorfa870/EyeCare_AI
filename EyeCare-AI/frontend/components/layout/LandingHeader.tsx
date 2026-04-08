"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/lib/store/authStore";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MagnifierToggle } from "@/components/MagnifierToggle";
import { motion } from "framer-motion";

export function LandingHeader() {
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleBrandClick = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="fixed top-0 z-50 w-full">
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full backdrop-blur-md bg-background/80 border-b border-border/10 "
      >
      <nav className="container mx-auto px-6 h-16 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo />
          <button
            type="button"
            onClick={handleBrandClick}
            className="text-xl font-bold tracking-tight hover:text-primary transition-colors"
          >
            EyeCare-AI
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <MagnifierToggle />
          <ThemeToggle />
          
          {user ? (
            <Link href={`/${user.role}/dashboard`}>
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-block">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  </div>
  );
}
