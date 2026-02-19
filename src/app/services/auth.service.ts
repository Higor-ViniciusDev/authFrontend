import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  token?: string;
  status?: 'active' | 'pending';
}

export interface RegisterResponse {
  message: string;
}

export interface VerifyEmailResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API_URL = 'http://34.46.10.239:8080';

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/validation`, { email, password }).pipe(
      tap((res) => {
        if (res.token) {
          sessionStorage.setItem('token', res.token);
        }
      }),
    );
  }

  signup(name: string, email: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/register`, { name, email, password });
  }

  // GET /verify?token=JWT → backend decodifica JWT, pega UUID, marca verified=true
  verifyEmail(token: string): Observable<VerifyEmailResponse> {
    return this.http.get<VerifyEmailResponse>(`${this.API_URL}/verify`, { params: { token } });
  }

  resendVerification(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/resend-verification`, { email });
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/forgot-password`, { email });
  }

  // WebSocket – aguarda confirmação em tempo real
  // Backend publica no exchange fan-out após verificar o JWT do link do email
  statusUpdates(email: string): Observable<'verified'> {
    return new Observable((observer) => {
      const socket = new WebSocket(
        `ws://localhost:8080/ws/verify-status?email=${encodeURIComponent(email)}`,
      );

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status === 'verified') {
            observer.next('verified');
            observer.complete();
          }
        } catch {
          observer.error(new Error('Mensagem inválida do servidor'));
        }
      };

      socket.onerror = (error) => observer.error(error);
      socket.onclose = () => observer.complete();

      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    });
  }

  logout(): void {
    sessionStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }
}
