import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submitted = false;
  loading = signal(false);
  errorMessage = signal('');

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage.set('');

    if (this.form.invalid) return;

    this.loading.set(true);
    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.status === 'pending') {
          this.router.navigate(['/verify-email'], { queryParams: { email } });
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Email ou senha inválidos.');
        } else if (err.status === 403 && err.error?.status === 'pending') {
          this.router.navigate(['/verify-email'], { queryParams: { email } });
        } else if (err.status === 0) {
          this.errorMessage.set('Servidor indisponível. Tente novamente.');
        } else {
          this.errorMessage.set('Ocorreu um erro. Tente novamente.');
        }
      },
    });
  }
}
