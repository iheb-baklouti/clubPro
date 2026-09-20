import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { RouteLoadingBar } from "@/components/features/layout/route-loading-bar";

export const metadata: Metadata = {
  title: "ClubPro",
  description: "Gestion de club de football amateur et semi-pro",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-dvh antialiased">
        <Suspense fallback={null}>
          <RouteLoadingBar />
        </Suspense>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
