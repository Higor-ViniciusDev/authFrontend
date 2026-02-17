import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.html',
  styleUrls: ['./verify-email.css'],
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  email = signal('');
  loading = signal(false);
  message = signal('');
  isError = signal(false);

  private statusSub?: Subscription;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT = 5;

  ngOnInit(): void {
    const emailParam = this.route.snapshot.queryParamMap.get('email');
    if (!emailParam) {
      this.router.navigate(['/']);
      return;
    }
    this.email.set(emailParam);
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.statusSub?.unsubscribe();
    clearTimeout(this.reconnectTimer);
  }

  private connectWebSocket(): void {
    this.statusSub?.unsubscribe();

    this.statusSub = this.authService.statusUpdates(this.email()).subscribe({
      next: (status) => {
        if (status === 'verified') {
          this.router.navigate(['/home']);
        }
      },
      error: () => {
        this.scheduleReconnect();
      },
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT) return;

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connectWebSocket();
    }, delay);
  }

  resendEmail(): void {
    this.loading.set(true);
    this.isError.set(false);
    this.message.set('');

    this.authService.resendVerification(this.email()).subscribe({
      next: () => {
        this.loading.set(false);
        this.message.set('Email de verificação reenviado com sucesso!');
        // Reconecta WS e reseta contador de tentativas
        this.reconnectAttempts = 0;
        this.connectWebSocket();
      },
      error: (err) => {
        this.loading.set(false);
        this.isError.set(true);
        if (err.status === 429) {
          this.message.set('Aguarde alguns minutos antes de reenviar.');
        } else {
          this.message.set('Erro ao reenviar email. Tente novamente mais tarde.');
        }
      },
    });
  }
}
