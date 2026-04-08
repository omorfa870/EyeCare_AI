"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { GlobalMagnifier } from "@/components/GlobalMagnifier";

interface MagnifierContextType {
  isMagnifyEnabled: boolean;
  setIsMagnifyEnabled: (enabled: boolean) => void;
}

const MagnifierContext = createContext<MagnifierContextType | undefined>(undefined);

export function MagnifierProvider({ children }: { children: ReactNode }) {
  const [isMagnifyEnabled, setIsMagnifyEnabled] = useState(false);
  const pathname = usePathname();

  // Reset magnifier when navigating away from landing page
  useEffect(() => {
    if (pathname !== "/") {
      setIsMagnifyEnabled(false);
    }
  }, [pathname]);

  // Global effect to add/remove a class to the body (only if on landing page)
  useEffect(() => {
    if (isMagnifyEnabled && pathname === "/") {
      document.body.classList.add("magnifier-enabled");
    } else {
      document.body.classList.remove("magnifier-enabled");
    }
  }, [isMagnifyEnabled, pathname]);

  return (
    <MagnifierContext.Provider value={{ isMagnifyEnabled, setIsMagnifyEnabled }}>
      <GlobalMagnifier />
      {children}
    </MagnifierContext.Provider>
  );
}

export function useMagnifier() {
  const context = useContext(MagnifierContext);
  if (context === undefined) {
    throw new Error("useMagnifier must be used within a MagnifierProvider");
  }
  return context;
}
