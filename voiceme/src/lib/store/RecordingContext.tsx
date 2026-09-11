"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export interface PendingRecording {
  blob: Blob;
  mode: "new" | "retry";
  sessionId?: string;
}

interface RecordingContextValue {
  pending: PendingRecording | null;
  setPending: (value: PendingRecording | null) => void;
}

const RecordingContext = createContext<RecordingContextValue | null>(null);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingRecording | null>(null);
  const value = useMemo(() => ({ pending, setPending }), [pending]);
  return <RecordingContext.Provider value={value}>{children}</RecordingContext.Provider>;
}

export function useRecordingContext(): RecordingContextValue {
  const ctx = useContext(RecordingContext);
  if (!ctx) throw new Error("useRecordingContext must be used within RecordingProvider");
  return ctx;
}
