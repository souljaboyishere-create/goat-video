"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import Button from "./Button";

export default function CTASection() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return (
    <section className="w-full py-12 md:py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
          {!isAuthenticated ? (
            <>
              <Link href="/projects/new">
                <Button variant="primary" size="lg">
                  Try Free
                </Button>
              </Link>

              <Link href="/pricing">
                <Button variant="secondary" size="lg">
                  See Pricing
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/projects">
                <Button variant="primary" size="lg">
                  My Projects
                </Button>
              </Link>

              <Button 
                variant="ghost" 
                size="lg"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
