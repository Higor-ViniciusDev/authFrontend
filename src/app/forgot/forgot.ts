import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot.html',
  styleUrls: ['./forgot.css']
})
export class ForgotComponent {
  private readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submitted = false;
  sent = false;

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.sent = true;
  }
}
