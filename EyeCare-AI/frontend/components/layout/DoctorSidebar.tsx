"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, FileText, CheckSquare, Stethoscope, Users } from "lucide-react";
import { Logo } from "@/components/Logo";

const navItems = [
  { href: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctor/appointments", label: "Schedule", icon: Calendar },
  { href: "/doctor/patients", label: "Patient Directory", icon: Users },
  { href: "/doctor/upload-scan", label: "AI Scan", icon: Stethoscope },
];

export function DoctorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col hidden lg:flex">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/doctor/dashboard">
          <Logo />
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2 flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5" /> Doctor Portal
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/doctor/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
