import { isCloudEnabled, supabase } from "./supabase";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  provider: "local" | "supabase";
}

interface LocalUserRecord {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const USERS_KEY = "mtm:users";
const SESSION_KEY = "mtm:profile";

function readUsers(): Record<string, LocalUserRecord> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LocalUserRecord>) : {};
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, LocalUserRecord>): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function randomId(): string {
  return `local-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** Restores a session. Supabase session if configured, otherwise the local profile. */
export async function restoreSession(): Promise<AuthUser | null> {
  if (isCloudEnabled && supabase) {
    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user;
    if (sessionUser) {
      return {
        id: sessionUser.id,
        email: sessionUser.email ?? "",
        name: (sessionUser.user_metadata?.name as string) ?? (sessionUser.email ?? "Player").split("@")[0],
        provider: "supabase",
      };
    }
  }
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as AuthUser;
  } catch {
    // fall through
  }
  return null;
}

/** Local mode: profile is stored on this device only, no password involved. */
export function registerLocal(name: string, email: string): AuthUser {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("Enter a valid email address.");
  const users = readUsers();
  if (users[cleanEmail]) throw new Error("A local profile with this email already exists. Sign in instead.");
  const user: AuthUser = {
    id: randomId(),
    email: cleanEmail,
    name: name.trim() || cleanEmail.split("@")[0],
    provider: "local",
  };
  users[cleanEmail] = { id: user.id, name: user.name, email: cleanEmail, createdAt: new Date().toISOString() };
  writeUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function signInLocal(email: string): AuthUser {
  const cleanEmail = email.trim().toLowerCase();
  const users = readUsers();
  const record = users[cleanEmail];
  if (!record) throw new Error("No local profile found for this email on this device.");
  const user: AuthUser = { id: record.id, email: record.email, name: record.name, provider: "local" };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function signInSupabase(email: string, password: string): Promise<AuthUser> {
  if (!supabase) throw new Error("Cloud is not configured.");
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw new Error(error.message);
  const su = data.user;
  return {
    id: su.id,
    email: su.email ?? email,
    name: (su.user_metadata?.name as string) ?? email.split("@")[0],
    provider: "supabase",
  };
}

export async function registerSupabase(name: string, email: string, password: string): Promise<AuthUser> {
  if (!supabase) throw new Error("Cloud is not configured.");
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { name: name.trim() } },
  });
  if (error) throw new Error(error.message);
  const su = data.user;
  if (!su) throw new Error("Check your email to confirm the account, then sign in.");
  return { id: su.id, email: su.email ?? email, name: name.trim(), provider: "supabase" };
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(SESSION_KEY);
  if (isCloudEnabled && supabase) await supabase.auth.signOut();
}
