import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminSession { accessToken: string; expiresInSeconds: number; user: { id: string; firstName: string; lastName: string; email: string; restaurantId: string; restaurantName: string; permissions: string[]; isOwner: boolean; }; }

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'meno-admin-session';
  readonly session = signal<AdminSession | null>(this.readSession());
  readonly signedIn = signal(this.session() !== null);
  async signIn(email: string, password: string): Promise<boolean> {
    try {
      const session = await firstValueFrom(this.http.post<AdminSession>(`${environment.apiBaseUrl}/auth/sign-in`, { email, password }));
      this.session.set(session);
      this.signedIn.set(true);
      sessionStorage.setItem(this.storageKey, JSON.stringify(session));
      return true;
    } catch {
      return false;
    }
  }
  signOut(): void { this.session.set(null); this.signedIn.set(false); sessionStorage.removeItem(this.storageKey); }
  isAuthenticated(): boolean { return this.signedIn(); }
  private readSession(): AdminSession | null { try { return JSON.parse(sessionStorage.getItem(this.storageKey) ?? 'null') as AdminSession | null; } catch { return null; } }
}
