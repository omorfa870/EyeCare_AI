"use client";

import { ReactNode } from "react";
import { PatientSidebar } from "@/components/layout/PatientSidebar";
import { AuthHeader } from "@/components/AuthHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* Desktop Sidebar */}
        <PatientSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Header */}
          <AuthHeader />
          
          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto relative z-0 relative pb-10">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
