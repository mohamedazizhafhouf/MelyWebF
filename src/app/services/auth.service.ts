import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../core/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3001/api/auth';

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<any> {
        console.log('Inside the auth service inside register function', data);

    return this.http.post(`${this.API_URL}/register`, data);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('recouvra_token', res.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('recouvra_token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('recouvra_token');
  }

  getToken(): string | null {
    return localStorage.getItem('recouvra_token');
  }
}