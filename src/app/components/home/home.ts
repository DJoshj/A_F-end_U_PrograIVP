import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet, RouterLinkWithHref, Router, NavigationEnd } from '@angular/router'; // Import Router and NavigationEnd
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../core/services/auth-service';
import { UsersService } from '../../core/services/users'; // Import UsersService
import { AuthGuardGuard } from '../../guards/auth-guard-guard';
import { Observable, filter } from 'rxjs'; // Import filter
import { AuthorizationGuard } from '../../guards/authorizationGuard';


@Component({
  selector: 'app-home',
  imports: [
    CommonModule, // Add CommonModule here
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
  activeRoute: string = ''; // Guarda la ruta activa
  showAdminButton: boolean = false; // Para controlar la visibilidad de los botones (solo admin está disponible)

  constructor(private authService: AuthService, private usersService: UsersService, private authorizationGuard: AuthorizationGuard, private router: Router) { } // Inyecta UsersService y Router

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.usersService.getCurrentUserRole().subscribe(userRole => {
      this.showAdminButton = userRole === 1; // Solo funciona para admin
    });

    // Se suscribe a los eventos del router para actualizar la ruta activa
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

  // mira si la ruta esta activa
  isRouteActive(route: string): boolean {
    return this.activeRoute.includes(route);
  }
}
