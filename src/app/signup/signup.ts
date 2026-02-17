import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submitted = false;
  loading = signal(false);
  errorMessage = signal('');

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage.set('');

    if (this.form.invalid) return;

    this.loading.set(true);
    const { name, email, password } = this.form.value;

    this.authService.signup(name, email, password).subscribe({
      next: () => {
        this.loading.set(false);
        // Cadastro OK → backend publicou na fila e vai enviar o email
        this.router.navigate(['/verify-email'], { queryParams: { email } });
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.errorMessage.set('Este email já está cadastrado.');
        } else if (err.status === 0) {
          this.errorMessage.set('Servidor indisponível. Tente novamente.');
        } else {
          this.errorMessage.set('Ocorreu um erro ao criar sua conta. Tente novamente.');
        }
      },
    });
  }
}
