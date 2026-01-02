import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import AnimatedBackground from "../components/AnimatedBackground";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "AI Video Creation Platform",
  description: "Create AI-powered videos with voice cloning, face transformation, and more",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎬</text></svg>" />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-charcoal">
        <AuthProvider>
          <div className="relative">
            <AnimatedBackground />
            <Navbar />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

