import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
    token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly API_URL = 'http://localhost:8080';

    login(email: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.API_URL}/validation`, { email, password }).pipe(
            tap((res) => {
                if (res.token) {
                    sessionStorage.setItem('token', res.token);
                }
            })
        );
    }

    signup(name: string, email: string, password: string): Observable<any> {
        return this.http.post(`${this.API_URL}/register`, { name, email, password });
    }

    resendVerification(email: string): Observable<any> {
        return this.http.post(`${this.API_URL}/resend-verification`, { email });
    }

    statusUpdates(email: string): Observable<string> {
        return new Observable((observer) => {
            const socket = new WebSocket(`ws://localhost:8080/ws/verify-status?email=${email}`);

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.status === 'verified') {
                    observer.next('verified');
                }
            };

            socket.onerror = (error) => observer.error(error);
            socket.onclose = () => observer.complete();

            return () => socket.close();
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
