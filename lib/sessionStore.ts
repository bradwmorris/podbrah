// lib/sessionStore.ts
import { Session } from '@supabase/supabase-js';

class SessionStore {
  private static instance: SessionStore;
  private currentSession: Session | null = null;
  private subscribers = new Set<() => void>();

  private constructor() {}

  static getInstance(): SessionStore {
    if (!SessionStore.instance) {
      SessionStore.instance = new SessionStore();
    }
    return SessionStore.instance;
  }

  setSession(session: Session | null) {
    this.currentSession = session;
    if (session) {
      sessionStorage.setItem('supabase.auth.token', JSON.stringify(session));
    } else {
      sessionStorage.removeItem('supabase.auth.token');
    }
    this.notifySubscribers();
  }

  getSession(): Session | null {
    if (!this.currentSession) {
      const stored = sessionStorage.getItem('supabase.auth.token');
      if (stored) {
        this.currentSession = JSON.parse(stored);
      }
    }
    return this.currentSession;
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  clear() {
    this.currentSession = null;
    sessionStorage.removeItem('supabase.auth.token');
    this.notifySubscribers();
  }
}

export const sessionStore = SessionStore.getInstance();