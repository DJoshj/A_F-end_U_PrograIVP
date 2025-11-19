import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet, RouterLinkWithHref, Router, NavigationEnd } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../core/services/auth-service';
import { UsersService } from '../../core/services/users';
import { AuthGuardGuard } from '../../guards/auth-guard-guard';
import { Observable, filter } from 'rxjs';
import { AuthorizationGuard } from '../../guards/authorizationGuard';

import {MatButtonModule} from '@angular/material/button';


@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatListModule,
    RouterLinkWithHref,
     MatButtonModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  showFiller = false;
  username: string | null = null;
  isAdmin$!: Observable<boolean>;
  activeRoute: string = ''; // Guarda la ruta activa
  showAdminButton: boolean = false; // Controla la visibilidad de los botones (solo admin)

  constructor(private authService: AuthService, private usersService: UsersService, private authorizationGuard: AuthorizationGuard, private router: Router) { }

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.usersService.getCurrentUserRole().subscribe(userRole => {
      this.showAdminButton = userRole === 1; // Solo visible para administradores
    });

    // Se suscribe a los eventos del router para actualizar la ruta activa
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.activeRoute = event.urlAfterRedirects;
    });
  }

  // Cierra la sesión del usuario
  logout(): void {
    this.authService.logout();
  }

  // Verifica si la ruta actual está activa
  isRouteActive(route: string): boolean {
    return this.activeRoute.includes(route);
  }
}
