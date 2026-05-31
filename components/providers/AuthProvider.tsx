"use client";

import { useAuthInitialization } from "@/hooks/useAuthInitialization";
import React from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  useAuthInitialization();

  return <>{children}</>;
}
