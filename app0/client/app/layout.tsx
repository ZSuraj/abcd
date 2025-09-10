import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { Noise } from "@/components/ui/noise";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "App0",
  description: "Docs and Tasks management by abcd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Static grain */}
        {/* <div className="-z-1 absolute inset-0 flex items-center justify-center">
          <Noise
            patternSize={150}
            patternScaleX={1}
            patternScaleY={1}
            patternRefreshInterval={100}
            patternAlpha={20}
          />
        </div> */}
        <SidebarProvider>
          <main className="w-full">{children}</main>
        </SidebarProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
