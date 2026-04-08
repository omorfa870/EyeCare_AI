"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMagnifier } from "@/components/MagnifierProvider";
import { cn } from "@/lib/utils";

const SPEED = 0.2; 
const IMAGE_ZOOM = 6.6; 
const UI_ZOOM = 1.5; 

export function GlobalMagnifier() {
  const { isMagnifyEnabled } = useMagnifier();
  const pathname = usePathname();

  if (pathname !== "/" || !isMagnifyEnabled) return null;
  
  const magnifierRef = useRef<HTMLDivElement>(null);
  const enlargedImageRef = useRef<HTMLImageElement>(null);
  const uiVaultRef = useRef<HTMLDivElement>(null);
  
  const mouse = useRef({ x: 0, y: 0 });
  const glass = useRef({ x: 0, y: 0 });
  const isVisible = useRef(false);
  const activeContent = useRef<{ src?: string, html?: string, type: 'image' | 'ui' | null }>({ type: null });
  const containerRect = useRef<DOMRect | null>(null);

  useEffect(() => {
    if (!isMagnifyEnabled) return;

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      isVisible.current = true;
      
      if (magnifierRef.current) {
        magnifierRef.current.style.opacity = "1";
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    
    let rafId: number;
    let lastHoveredElement: Element | null = null;

    const moveGlass = () => {
      glass.current.x += (mouse.current.x - glass.current.x) * SPEED;
      glass.current.y += (mouse.current.y - glass.current.y) * SPEED;

      if (magnifierRef.current) {
        magnifierRef.current.style.transform = `translate(calc(${glass.current.x}px - 50%), calc(${glass.current.y}px - 50%))`;
      }

      // Briefly disable pointer events on the magnifier to perform true hit testing
      if (magnifierRef.current) magnifierRef.current.style.display = 'none';
      const target = document.elementFromPoint(mouse.current.x, mouse.current.y);
      if (magnifierRef.current) magnifierRef.current.style.display = 'block';

      if (target && target !== lastHoveredElement) {
        lastHoveredElement = target;
        
        const img = target.closest('img');
        let uiElement = target.closest('button, a, label, li, h1, h2, h3, h4, h5, h6, p, svg, [data-magnifiable], .card');
        
        // Fallback for rich generic wrappers if they aren't massive background sections
        if (!uiElement && !img) {
          const rect = target.getBoundingClientRect();
          if (rect.width > 0 && rect.width < 800 && rect.height > 0 && rect.height < 800) {
            uiElement = target;
          }
        }

        if (img) {
          if (activeContent.current.src !== img.src) {
            const computedStyle = window.getComputedStyle(img);
            activeContent.current = { src: img.src, type: 'image' };
            containerRect.current = img.getBoundingClientRect();
            
            if (enlargedImageRef.current) {
              enlargedImageRef.current.src = img.src;
              enlargedImageRef.current.style.display = "block";
              enlargedImageRef.current.style.objectFit = computedStyle.objectFit;
              enlargedImageRef.current.style.objectPosition = computedStyle.objectPosition;
              enlargedImageRef.current.style.borderRadius = computedStyle.borderRadius;
            }
            if (uiVaultRef.current) uiVaultRef.current.style.display = "none";
          }
        } else if (uiElement) {
          const html = uiElement.outerHTML;
          if (activeContent.current.html !== html) {
            activeContent.current = { html: html, type: 'ui' };
            containerRect.current = uiElement.getBoundingClientRect();
            
            if (uiVaultRef.current) {
              uiVaultRef.current.innerHTML = html;
              uiVaultRef.current.style.display = "block";
              
              const innerChild = uiVaultRef.current.firstElementChild as HTMLElement;
              if (innerChild) {
                // Force cloned elements to maintain their extracted bounds
                innerChild.style.width = '100%';
                innerChild.style.height = '100%';
                innerChild.style.margin = '0';
              }
            }
            if (enlargedImageRef.current) enlargedImageRef.current.style.display = "none";
          }
        } else {
          activeContent.current = { type: null };
          if (uiVaultRef.current) uiVaultRef.current.style.display = "none";
          if (enlargedImageRef.current) enlargedImageRef.current.style.display = "none";
        }
      }

      // Unified Pixel Math for perfect center-tracking
      if (containerRect.current && activeContent.current.type) {
        const rect = containerRect.current;
        const targetZoom = activeContent.current.type === 'image' ? IMAGE_ZOOM : UI_ZOOM;
        
        const offsetX = -(glass.current.x - rect.left) * targetZoom;
        const offsetY = -(glass.current.y - rect.top) * targetZoom;
        
        const contentRef = activeContent.current.type === 'image' ? enlargedImageRef : uiVaultRef;
        
        if (contentRef.current) {
          contentRef.current.style.width = `${rect.width}px`;
          contentRef.current.style.height = `${rect.height}px`;
          contentRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${targetZoom})`;
        }
      }

      if (mouse.current.x === 0 && mouse.current.y === 0 && magnifierRef.current) {
         magnifierRef.current.style.opacity = "0";
      }

      rafId = requestAnimationFrame(moveGlass);
    };

    moveGlass();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [isMagnifyEnabled]);

  if (!isMagnifyEnabled) return null;

  return (
    <div
      ref={magnifierRef}
      className={cn(
        "fixed top-0 left-0 z-[9999] pointer-events-none overflow-hidden",
        "w-[15vw] max-w-[10rem] h-[15vw] max-h-[10rem]",
        "border-[5px] border-white/40 rounded-full bg-background/5 shadow-2xl backdrop-blur-sm",
        "transition-opacity duration-300 ease-out",
        "ring-1 ring-primary/20 ring-inset"
      )}
      style={{ opacity: 0 }}
    >
      <div className="absolute inset-0 grayscale-[0.05] contrast-[1.05] z-0">
        
        {/* Absolute Axis Center - Used for math translations */}
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          
          {/* Image Hub */}
          <img 
            ref={enlargedImageRef}
            src="" 
            alt="Magnified View" 
            className="absolute origin-top-left"
            draggable="false"
            style={{ display: 'none' }}
          />

          {/* UI Hub */}
          <div 
            ref={uiVaultRef}
            className="absolute origin-top-left text-foreground pointer-events-none"
            style={{ display: 'none' }}
          />
          
        </div>
      </div>

      {/* Clinical HUD Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-1/2 left-0 w-full h-px bg-primary/40 -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 w-px h-full bg-primary/40 -translate-x-1/2" />
        
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary/30 rounded-full" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary/30 rounded-full" />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary/30 rounded-full" />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary/30 rounded-full" />
        
        <div className="absolute inset-0 bg-primary/5 mix-blend-overlay opacity-50" />
      </div>

      <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] pointer-events-none z-20" />
    </div>
  );
}
