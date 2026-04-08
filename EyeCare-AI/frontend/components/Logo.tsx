'use client'
import Image from 'next/image';

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image 
        src="/images/logo.png" 
        alt="RemoteEye Logo"
        width={100}
        height={50}
        priority
      />
    </div>
  );
}
