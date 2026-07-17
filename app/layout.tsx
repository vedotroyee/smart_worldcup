import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import AmbientBackground from "@/components/AmbientBackground";
import AmbientPlayers from "@/components/AmbientPlayers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-next",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display-next",
});

export const metadata: Metadata = {
  title: "WC26 Stadium AI Platform",
  description: "Generative AI platform for FIFA World Cup 2026 stadium operations and fan experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased">
        <AmbientBackground />
        <AmbientPlayers />
        <AuthProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 pb-16 pt-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
