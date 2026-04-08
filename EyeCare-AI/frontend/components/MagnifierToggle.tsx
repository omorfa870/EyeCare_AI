"use client";

import * as React from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMagnifier } from "@/components/MagnifierProvider";
import { Button } from "@/components/ui/button";

export function MagnifierToggle() {
  const { isMagnifyEnabled, setIsMagnifyEnabled } = useMagnifier();
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <Button
      variant={isMagnifyEnabled ? "default" : "ghost"}
      size="icon"
      onClick={() => setIsMagnifyEnabled(!isMagnifyEnabled)}
      className="rounded-full w-9 h-9 border"
      aria-label="Toggle Magnifier"
    >
      {isMagnifyEnabled ? (
        <ZoomOut className="h-4 w-4" />
      ) : (
        <ZoomIn className="h-4 w-4" />
      )}
    </Button>
  );
}
