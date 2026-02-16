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
    styleUrls: ['./verify-email.css']
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);

    email = signal('');
    loading = signal(false);
    message = signal('');
    isError = signal(false);

    private statusSubscription?: Subscription;

    ngOnInit(): void {
        const emailParam = this.route.snapshot.queryParamMap.get('email');
        if (!emailParam) {
            this.router.navigate(['/']);
            return;
        }
        this.email.set(emailParam);

        // Inicia monitoramento via WebSocket
        this.statusSubscription = this.authService.statusUpdates(emailParam).subscribe({
            next: (status) => {
                if (status === 'verified') {
                    this.router.navigate(['/home']);
                }
            },
            error: (err) => {
                console.error('WebSocket error:', err);
                // Em caso de erro no WS, poderíamos tentar reconectar ou avisar o usuário
            }
        });
    }

    ngOnDestroy(): void {
        this.statusSubscription?.unsubscribe();
    }

    resendEmail(): void {
        this.loading.set(true);
        this.isError.set(false);
        this.message.set('');

        this.authService.resendVerification(this.email()).subscribe({
            next: () => {
                this.loading.set(false);
                this.message.set('Email de verificação reenviado com sucesso!');
            },
            error: (err) => {
                this.loading.set(false);
                this.isError.set(true);
                this.message.set('Erro ao reenviar email. Tente novamente mais tarde.');
            }
        });
    }
}
