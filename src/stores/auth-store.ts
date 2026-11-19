import { create } from "zustand";
import {
  registerLocal,
  restoreSession,
  signInLocal,
  signInSupabase,
  registerSupabase,
  signOut,
  type AuthUser,
} from "../services/auth-service";

type AuthStatus = "idle" | "loading" | "error";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  initialized: boolean;
  init(): Promise<void>;
  register(name: string, email: string, password?: string): Promise<boolean>;
  signIn(email: string, password?: string): Promise<boolean>;
  logout(): Promise<void>;
  clearError(): void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  error: null,
  initialized: false,

  async init() {
    const user = await restoreSession();
    set({ user, initialized: true });
  },

  async register(name, email, password) {
    set({ status: "loading", error: null });
    try {
      const user = password !== undefined ? await registerSupabase(name, email, password) : registerLocal(name, email);
      set({ user, status: "idle" });
      return true;
    } catch (error) {
      set({ status: "error", error: error instanceof Error ? error.message : "Registration failed." });
      return false;
    }
  },

  async signIn(email, password) {
    set({ status: "loading", error: null });
    try {
      const user = password !== undefined ? await signInSupabase(email, password) : signInLocal(email);
      set({ user, status: "idle" });
      return true;
    } catch (error) {
      set({ status: "error", error: error instanceof Error ? error.message : "Sign in failed." });
      return false;
    }
  },

  async logout() {
    await signOut();
    set({ user: null, status: "idle", error: null });
  },

  clearError() {
    set({ error: null });
  },
}));
