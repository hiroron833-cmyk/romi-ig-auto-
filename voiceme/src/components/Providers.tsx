"use client";

import type { ReactNode } from "react";
import { RecordingProvider } from "@/lib/store/RecordingContext";

export default function Providers({ children }: { children: ReactNode }) {
  return <RecordingProvider>{children}</RecordingProvider>;
}
