import type {
  AnalysisResult,
  AnalyticsEvent,
  ConcernKey,
  GoalKey,
  LessonId,
  RecordingSession,
} from "@/types/domain";

const KEYS = {
  onboarding: "voiceme.onboarding",
  sessions: "voiceme.sessions",
  analytics: "voiceme.analytics",
} as const;

interface Onboarding {
  concerns: ConcernKey[];
  goals: GoalKey[];
  completedAt: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (e.g. private browsing) — fail silently,
    // the app still works within a single session.
  }
}

export function getOnboarding(): Onboarding | null {
  return readJson<Onboarding | null>(KEYS.onboarding, null);
}

export function saveOnboarding(concerns: ConcernKey[], goals: GoalKey[]): void {
  writeJson<Onboarding>(KEYS.onboarding, {
    concerns,
    goals,
    completedAt: new Date().toISOString(),
  });
  track("onboarding_complete", { concerns, goals });
}

export function listSessions(): RecordingSession[] {
  return readJson<RecordingSession[]>(KEYS.sessions, []).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function getSession(id: string): RecordingSession | undefined {
  return listSessions().find((s) => s.id === id);
}

function saveSessions(sessions: RecordingSession[]): void {
  writeJson(KEYS.sessions, sessions);
}

export function createSession(before: AnalysisResult): RecordingSession {
  const onboarding = getOnboarding();
  const session: RecordingSession = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    concerns: onboarding?.concerns ?? [],
    goals: onboarding?.goals ?? [],
    before,
  };
  const sessions = listSessions();
  sessions.push(session);
  saveSessions(sessions);
  track("analysis_complete", { sessionId: session.id, scores: before.scores });
  return session;
}

export function attachLesson(sessionId: string, lessonId: LessonId): void {
  const sessions = listSessions();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx] = { ...sessions[idx], lessonId };
  saveSessions(sessions);
  track("lesson_start", { sessionId, lessonId });
}

export function markLessonCompleted(sessionId: string): void {
  const sessions = listSessions();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx] = { ...sessions[idx], lessonCompletedAt: new Date().toISOString() };
  saveSessions(sessions);
  track("lesson_complete", { sessionId });
}

export function attachAfterAnalysis(sessionId: string, after: AnalysisResult): void {
  const sessions = listSessions();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return;
  sessions[idx] = { ...sessions[idx], after };
  saveSessions(sessions);
  track("re_record", { sessionId });
}

export function deleteSession(sessionId: string): void {
  const sessions = listSessions().filter((s) => s.id !== sessionId);
  saveSessions(sessions);
}

export function deleteAllData(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEYS.onboarding);
  window.localStorage.removeItem(KEYS.sessions);
  window.localStorage.removeItem(KEYS.analytics);
}

export function getLatestSession(): RecordingSession | undefined {
  return listSessions()[0];
}

// Lightweight local KPI log. In production this would POST to /api/track
// and land in a real analytics store; for the MVP it stays on-device.
export function track(event: AnalyticsEvent, meta: Record<string, unknown> = {}): void {
  const log = readJson<{ event: AnalyticsEvent; at: string; meta: Record<string, unknown> }[]>(
    KEYS.analytics,
    [],
  );
  log.push({ event, at: new Date().toISOString(), meta });
  writeJson(KEYS.analytics, log.slice(-200));
}

export function getAnalyticsLog() {
  return readJson<{ event: AnalyticsEvent; at: string; meta: Record<string, unknown> }[]>(
    KEYS.analytics,
    [],
  );
}
