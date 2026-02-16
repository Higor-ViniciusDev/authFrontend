import { Component, inject, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './navbar/navbar';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  protected readonly showNavbar = computed(() => {
    const url = this.currentUrl();
    const authRoutes = ['/', '/forgot', '/signup', '/verify-email'];
    return !authRoutes.includes(url);
  });
}
