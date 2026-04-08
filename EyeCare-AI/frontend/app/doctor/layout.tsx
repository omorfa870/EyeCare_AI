"use client";

import { ReactNode } from "react";
import { DoctorSidebar } from "@/components/layout/DoctorSidebar";
import { AuthHeader } from "@/components/AuthHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* Desktop Sidebar */}
        <DoctorSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Header */}
          <AuthHeader />
          
          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto relative z-0 pb-10">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
