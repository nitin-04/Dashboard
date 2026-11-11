import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { SessionRecord, User } from './interfaces/session.interface';

@Injectable()
export class SessionService implements OnModuleDestroy {
  // In-memory session store: Token -> SessionRecord
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Run cleanup every 5 minutes to remove expired sessions
    this.cleanupInterval = setInterval(() => {
      this.purgeExpiredSessions();
    }, 5 * 60 * 1000);
  }

  /**
   * Creates a cryptographically random session token and stores session in memory.
   */
  createSession(user: User, ttlMs: number = 3600000): SessionRecord {
    const token = randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);

    const session: SessionRecord = {
      token,
      user,
      createdAt: now,
      expiresAt,
    };

    this.sessions.set(token, session);
    return session;
  }

  /**
   * Retrieves a session by token, validating expiration.
   */
  getSession(token: string): SessionRecord | null {
    if (!token) return null;

    const session = this.sessions.get(token);
    if (!session) return null;

    // Check if expired
    if (new Date() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  /**
   * Invalidates and deletes a session by token.
   */
  deleteSession(token: string): boolean {
    if (!token) return false;
    return this.sessions.delete(token);
  }

  /**
   * Returns the count of all active, non-expired sessions.
   */
  getActiveSessionCount(): number {
    this.purgeExpiredSessions();
    return this.sessions.size;
  }

  /**
   * Cleans up expired sessions from memory.
   */
  private purgeExpiredSessions(): void {
    const now = new Date();
    for (const [token, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(token);
      }
    }
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
