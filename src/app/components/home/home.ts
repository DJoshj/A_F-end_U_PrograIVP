import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet, RouterLinkWithHref, Router, NavigationEnd } from '@angular/router'; // Import Router and NavigationEnd
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../core/services/auth-service';
import { AuthGuardGuard } from '../../guards/auth-guard-guard';
import { Observable, filter } from 'rxjs'; // Import filter
import { AuthorizationGuard } from '../../guards/authorizationGuard';


@Component({
  selector: 'app-home',
  imports: [
    RouterOutlet,
    MatIconModule,
    MatListModule,
    RouterLinkWithHref
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  username: string | null = null;
  isAdmin$!: Observable<boolean>;
  activeRoute: string = ''; // To store the currently active route

  constructor(private authService: AuthService, private authorizationGuard: AuthorizationGuard, private router: Router) { } // Inject Router

  ngOnInit(): void {
    this.username = this.authService.getUsername();

    // Subscribe to router events to update activeRoute
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.activeRoute = event.urlAfterRedirects;
    });
  }

  //metodos
  logout(): void {
    this.authService.logout();
  }

  // Method to check if a route is active
  isRouteActive(route: string): boolean {
    return this.activeRoute.includes(route);
  }
}
