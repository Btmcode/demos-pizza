"use client";

import * as React from "react";
import { SessionProvider } from "next-auth";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
