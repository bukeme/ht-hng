"use client";

import { create } from "zustand";
import type { Session, User } from "@/types/auth";
import { STORAGE_KEYS } from "./constants";
import { readJson, removeStorageKey, writeJson } from "./storage";

type Credentials = {
  email: string;
  password: string;
};

type AuthSuccess = {
  ok: true;
};

type AuthFailure = {
  ok: false;
  error: string;
};

type SignupSuccess = AuthSuccess & {
  user: User;
  session: Session;
};

type LoginSuccess = AuthSuccess & {
  session: Session;
};

type AuthResult = SignupSuccess | LoginSuccess | AuthFailure;

type AuthState = {
  users: User[];
  session: Session | null;
  hydrated: boolean;
  hydrate: () => void;
  signup: (credentials: Credentials) => AuthResult;
  login: (credentials: Credentials) => AuthResult;
  logout: () => void;
  currentUser: () => User | null;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const isValidSession = (users: User[], session: Session | null) => {
  if (!session) return null;
  const matchedUser = users.find(
    (user) => user.id === session.userId && user.email === session.email
  );
  return matchedUser ? session : null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  users: [],
  session: null,
  hydrated: false,

  hydrate: () => {
    if (typeof window === "undefined") return;

    const users = readJson<User[]>(STORAGE_KEYS.users, []);
    const storedSession = readJson<Session | null>(STORAGE_KEYS.session, null);
    const session = isValidSession(users, storedSession);

    if (storedSession !== session) {
      writeJson(STORAGE_KEYS.session, session);
    }

    set({
      users,
      session,
      hydrated: true,
    });
  },

  signup: ({ email, password }) => {
    if (!get().hydrated) {
      get().hydrate();
    }

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return { ok: false, error: "Email is required" };
    }

    if (!password) {
      return { ok: false, error: "Password is required" };
    }

    const existingUser = get().users.find(
      (user) => user.email.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      return { ok: false, error: "User already exists" };
    }

    const user: User = {
      id: createId(),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
    };

    const session: Session = {
      userId: user.id,
      email: user.email,
    };

    const users = [...get().users, user];

    set({
      users,
      session,
    });

    writeJson(STORAGE_KEYS.users, users);
    writeJson(STORAGE_KEYS.session, session);

    return {
      ok: true,
      user,
      session,
    };
  },

  login: ({ email, password }) => {
    if (!get().hydrated) {
      get().hydrate();
    }

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return { ok: false, error: "Invalid email or password" };
    }

    const user = get().users.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalizedEmail &&
        candidate.password === password
    );

    if (!user) {
      return { ok: false, error: "Invalid email or password" };
    }

    const session: Session = {
      userId: user.id,
      email: user.email,
    };

    set({ session });
    writeJson(STORAGE_KEYS.session, session);

    return {
      ok: true,
      session,
    };
  },

  logout: () => {
    set({ session: null });
    removeStorageKey(STORAGE_KEYS.session);
  },

  currentUser: () => {
    const { users, session } = get();
    if (!session) return null;

    return (
      users.find(
        (user) => user.id === session.userId && user.email === session.email
      ) ?? null
    );
  },
}));
