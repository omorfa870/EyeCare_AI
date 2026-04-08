"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Building2, 
  Settings,
  ShieldCheck,
  ChevronRight,
  LogOut
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const navItems = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/patients", label: "Patient Registry", icon: Users },
  { href: "/admin/doctors", label: "Medical Officers", icon: UserPlus },
  { href: "/admin/hospitals", label: "Add/Delete Hospitals", icon: Building2 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 flex-shrink-0 bg-card text-card-foreground border-r border-border flex flex-col hidden lg:flex relative overflow-hidden group/sidebar">
      {/* Subtle adaptive glow effect */}
      <div className="absolute top-0 left-0 w-full h-64 bg-primary/5 dark:bg-primary/10 blur-[100px] pointer-events-none -z-10" />
      
      <div className="h-20 flex items-center px-8 border-b border-border/50">
        <Link href="/admin/dashboard" className="transition-all hover:scale-105 active:scale-95 duration-300">
           <Logo className="h-8 w-auto" />
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-8 px-6 space-y-8 scrollbar-none">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 px-2 flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-primary/60" /> Administrative Hub
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm group relative",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive ? "scale-110" : "opacity-60 group-hover:opacity-100"
                    )} />
                    {item.label}
                  </div>
                  {isActive && (
                    <motion.div layoutId="activeTab" className="absolute left-0 w-1.5 h-6 bg-primary rounded-full" />
                  )}
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-all duration-300",
                    isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0"
                  )} />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-8 border-t border-border/50">
           <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-2">Settings</div>
           <Button variant="ghost" className="w-full justify-start rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive font-bold group px-4 py-6">
              <LogOut className="mr-3 h-5 w-5 opacity-60 group-hover:opacity-100" /> Sign Out Portal
           </Button>
        </div>
      </div>

      {/* Version badge */}
      <div className="p-6 border-t border-border/50 mt-auto">
        <div className="bg-muted/50 rounded-2xl p-4 border border-border/20">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">System Version</p>
          <div className="flex items-center justify-between text-xs font-bold text-foreground/80">
             <span>V4.2.0-STABLE</span>
             <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          </div>
        </div>
      </div>
    </aside>
  );
}


