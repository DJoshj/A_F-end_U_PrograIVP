import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet, RouterLinkWithHref, Router, NavigationEnd } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../core/services/auth-service';
import { UsersService } from '../../core/services/users';
import { filter } from 'rxjs';
import { AuthorizationGuard } from '../../guards/authorizationGuard';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatListModule,
    RouterLinkWithHref,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  username: string | null = null;
  activeRoute: string = '';
  showAdminButton: boolean = false;

  constructor(private authService: AuthService, private usersService: UsersService, private authorizationGuard: AuthorizationGuard, private router: Router) { }

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.usersService.getCurrentUserRole().subscribe(userRole => {
      this.showAdminButton = userRole === 1;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.activeRoute = event.urlAfterRedirects;
    });
  }

  /**
   * Cierra la sesión del usuario.
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Verifica si la ruta actual está activa.
   * @param route La ruta a verificar.
   */
  isRouteActive(route: string): boolean {
    return this.activeRoute.includes(route);
  }
}
