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
        return !!this.getToken();
    }

    isSaasUserSession(): boolean {
        return this.getSession()?.accountType === 'SAAS';
    }

    getToken(): string | null {
        return this.getSession()?.token ?? null;
    }

    getSession(): StoredSession | null {
        const rawSession = localStorage.getItem(this.storageKey);
        if (!rawSession) {
            return null;
        }

        try {
            return JSON.parse(rawSession) as StoredSession;
        } catch {
            this.logout();
            return null;
        }
    }

    private storeSession(response: LoginResponse): void {
        const session: StoredSession = {
            token: response.token,
            tokenType: response.tokenType,
            email: response.email,
            role: response.role,
            organizationId: response.organizationId,
            accountType: response.accountType
        };
        localStorage.setItem(this.storageKey, JSON.stringify(session));
    }
}
