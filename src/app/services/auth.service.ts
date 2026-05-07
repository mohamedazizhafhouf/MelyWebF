import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, RegistrationResponse, StoredSession } from '../core/models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = 'http://localhost:8090/api/v1/auth';
    private readonly storageKey = 'mely_auth_session';

    constructor(private http: HttpClient) {}

    register(data: RegisterRequest): Observable<RegistrationResponse> {
        return this.http.post<RegistrationResponse>(`${this.apiUrl}/register`, data);
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap((response) => this.storeSession(response))
        );
    }

    logout(): void {
        localStorage.removeItem(this.storageKey);
    }

    isLoggedIn(): boolean {
        return !!this.getSession();
    }

    isSaasUserSession(): boolean {
        const session = this.getSession();
        return session?.accountType === 'SAAS';
    }

    getToken(): string | null {
        return this.getSession()?.token ?? null;
    }

    /** User id from login payload or JWT `userId` claim (for API calls). */
    getUserId(): string | null {
        const session = this.getSession();
        if (session?.userId) {
            return session.userId;
        }
        const token = session?.token;
        if (!token) {
            return null;
        }
        try {
            const payloadSegment = token.split('.')[1];
            if (!payloadSegment) {
                return null;
            }
            const normalizedPayload = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
            const padding = (4 - (normalizedPayload.length % 4)) % 4;
            const paddedPayload = normalizedPayload.padEnd(normalizedPayload.length + padding, '=');
            const payload = JSON.parse(atob(paddedPayload)) as { userId?: string };
            return payload.userId ?? null;
        } catch {
            return null;
        }
    }

    getSession(): StoredSession | null {
        const rawSession = localStorage.getItem(this.storageKey);
        if (!rawSession) {
            return null;
        }

        try {
            const session = JSON.parse(rawSession) as StoredSession;
            if (!session.token || this.isTokenExpired(session.token)) {
                this.logout();
                return null;
            }
            return session;
        } catch {
            this.logout();
            return null;
        }
    }

    private storeSession(response: LoginResponse): void {
        const session: StoredSession = {
            token: response.token,
            tokenType: response.tokenType,
            userId: response.userId,
            email: response.email,
            role: response.role,
            organizationId: response.organizationId,
            accountType: response.accountType
        };
        localStorage.setItem(this.storageKey, JSON.stringify(session));
    }

    private isTokenExpired(token: string): boolean {
        try {
            const payloadSegment = token.split('.')[1];
            if (!payloadSegment) {
                return true;
            }

            const normalizedPayload = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
            const padding = (4 - (normalizedPayload.length % 4)) % 4;
            const paddedPayload = normalizedPayload.padEnd(normalizedPayload.length + padding, '=');
            const payload = JSON.parse(atob(paddedPayload)) as { exp?: number };

            if (!payload.exp) {
                return true;
            }

            return payload.exp * 1000 <= Date.now();
        } catch {
            return true;
        }
    }
}
