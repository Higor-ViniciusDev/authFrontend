import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

type VerifyState = 'loading' | 'success' | 'expired' | 'error';

@Component({
  selector: 'app-verify-callback',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-callback.html',
  styleUrls: ['./verify-callback.css'],
})
export class VerifyCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  state = signal<VerifyState>('loading');
  errorMessage = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.state.set('error');
      this.errorMessage.set('Link inválido. Nenhum token encontrado.');
      return;
    }

    // GET /verify?token=JWT
    // Backend: decodifica JWT, valida purpose e exp, pega UUID,
    // marca verified=true, publica no exchange fan-out do RabbitMQ
    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.state.set('success');
        setTimeout(() => this.router.navigate(['/']), 3000);
      },
      error: (err) => {
        if (err.status === 410 || err.error?.code === 'token_expired') {
          this.state.set('expired');
        } else if (err.status === 409) {
          // Email já verificado anteriormente → trata como sucesso
          this.state.set('success');
          setTimeout(() => this.router.navigate(['/']), 3000);
        } else {
          this.state.set('error');
          this.errorMessage.set('Link inválido ou expirado.');
        }
      },
    });
  }
}
