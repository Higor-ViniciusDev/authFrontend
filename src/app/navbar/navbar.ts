import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLogged = signal<boolean>(!!sessionStorage.getItem('token'));

  private onStorage = (e: StorageEvent) => {
    if (e.key === 'token') this.isLogged.set(!!e.newValue);
  };

  ngOnInit(): void {
    window.addEventListener('storage', this.onStorage);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.onStorage);
  }

  // Método utilitário para desenvolvimento: alterna token de sessão de exemplo
  toggleMockLogin(): void {
    if (this.isLogged()) {
      sessionStorage.removeItem('token');
      this.isLogged.set(false);
    } else {
      sessionStorage.setItem('token', 'mock-token');
      this.isLogged.set(true);
    }
  }
}
