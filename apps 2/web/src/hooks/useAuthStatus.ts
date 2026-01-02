"use client";

import { useAuth } from "../contexts/AuthContext";

export function useAuthStatus() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  return { isAuthenticated, setIsAuthenticated };
}

