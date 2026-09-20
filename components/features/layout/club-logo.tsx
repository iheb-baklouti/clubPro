import Image from "next/image";
import { ShieldHalf } from "lucide-react";

import { cn } from "@/lib/utils";

export function ClubLogo({ logoUrl, className }: { logoUrl: string | null; className?: string }) {
  if (logoUrl) {
    return (
      <div className={cn("relative h-9 w-9 shrink-0 overflow-hidden rounded-lg", className)}>
        <Image src={logoUrl} alt="Logo du club" fill sizes="64px" className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary",
        className,
      )}
    >
      <ShieldHalf className="h-5 w-5" />
    </div>
  );
}
