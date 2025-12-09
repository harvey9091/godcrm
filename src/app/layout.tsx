import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Plus_Jakarta_Sans, IBM_Plex_Mono, Lora } from "next/font/google";
import "./globals.css";
import "./stone-theme.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/layout/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fonts required by the Violet Bloom theme
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GodCRM - Video Editor & Creative Agency CRM",
  description: "A CRM solution for video editors and creative agencies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable} ${lora.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}