import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    canActivate: [guestGuard],
    loadComponent: () => import('./signup/signup').then((m) => m.SignupComponent),
  },
  {
    path: 'forgot',
    canActivate: [guestGuard],
    loadComponent: () => import('./forgot/forgot').then((m) => m.ForgotComponent),
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./verify-email/verify-email').then((m) => m.VerifyEmailComponent),
  },
  {
    // Rota que o link do email aponta: /verify-callback?token=JWT
    path: 'verify-callback',
    loadComponent: () =>
      import('./verify-callback/verify-callback').then((m) => m.VerifyCallbackComponent),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home').then((m) => m.HomeComponent),
  },
  { path: '**', redirectTo: '' },
];
