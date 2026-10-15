import type { AuthSession, PasswordChangeInput, ServiceResult, SignInInput } from "../../types/commerce";
import { previewDelay, readStorage, removeStorage, writeStorage } from "../storage";

const SESSION_KEY = "spusa-demo-session-v1";

const demoIdentity = {
  userId: "demo-customer",
  username: "demo.customer",
  email: "demo.customer@example.com",
  password: "preview-only",
};

type StoredSession = {
  userId: string;
  remember: boolean;
};

type Listener = (session: AuthSession | null) => void;

function toSession(remember: boolean): AuthSession {
  return {
    userId: demoIdentity.userId,
    username: demoIdentity.username,
    email: demoIdentity.email,
    remember,
    demo: true,
  };
}

class DemoAuthService {
  private session: AuthSession | null = null;
  private listeners = new Set<Listener>();
  private hydrated = false;

  current() {
    this.hydrate();
    return this.session;
  }

  subscribe(listener: Listener) {
    this.hydrate();
    this.listeners.add(listener);
    listener(this.session);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async signIn(input: SignInInput): Promise<ServiceResult<AuthSession>> {
    await previewDelay(220);
    const username = input.username.trim().toLowerCase();
    const matchesUser = username === demoIdentity.username || username === demoIdentity.email;
    if (!matchesUser || input.password !== demoIdentity.password) {
      return { ok: false, message: "The username or password is incorrect." };
    }
    const session = toSession(input.remember);
    this.session = session;
    const stored: StoredSession = { userId: demoIdentity.userId, remember: input.remember };
    removeStorage(localStorage, SESSION_KEY);
    removeStorage(sessionStorage, SESSION_KEY);
    writeStorage(input.remember ? localStorage : sessionStorage, SESSION_KEY, stored);
    this.emit();
    return { ok: true, data: session };
  }

  signOut() {
    this.hydrate();
    this.session = null;
    removeStorage(localStorage, SESSION_KEY);
    removeStorage(sessionStorage, SESSION_KEY);
    this.emit();
  }

  previewPasswordChange(input: PasswordChangeInput): ServiceResult<{ saved: false }> {
    if (input.password.length < 8) {
      return { ok: false, message: "Use at least 8 characters.", fieldErrors: { password: "Use at least 8 characters." } };
    }
    if (input.password !== input.confirmPassword) {
      return {
        ok: false,
        message: "Those passwords do not match.",
        fieldErrors: { confirmPassword: "Those passwords do not match." },
      };
    }
    return { ok: true, data: { saved: false } };
  }

  private hydrate() {
    if (this.hydrated) {
      return;
    }
    this.hydrated = true;
    const fromSession = readStorage<StoredSession>(sessionStorage, SESSION_KEY);
    const fromLocal = readStorage<StoredSession>(localStorage, SESSION_KEY);
    const stored = fromSession ?? fromLocal;
    if (stored?.userId === demoIdentity.userId) {
      this.session = toSession(Boolean(stored.remember));
    }
  }

  private emit() {
    this.listeners.forEach((listener) => listener(this.session));
  }
}

export const authService = new DemoAuthService();
export const demoLoginHint = {
  username: demoIdentity.username,
  email: demoIdentity.email,
  password: demoIdentity.password,
};
