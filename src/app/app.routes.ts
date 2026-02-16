import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', loadComponent: () => import('./login/login').then(m => m.LoginComponent) },
	{ path: 'signup', loadComponent: () => import('./signup/signup').then(m => m.SignupComponent) },
	{ path: 'home', loadComponent: () => import('./home/home').then(m => m.HomeComponent) },
	{ path: 'forgot', loadComponent: () => import('./forgot/forgot').then(m => m.ForgotComponent) },
	{ path: 'verify-email', loadComponent: () => import('./verify-email/verify-email').then(m => m.VerifyEmailComponent) },
	{ path: '**', redirectTo: '' }
];
