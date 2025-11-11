import { Component } from '@angular/core';
import { RouterOutlet,RouterLinkWithHref, Router } from '@angular/router';
import { Users } from '../../../../core/services/users';
import { AuthService } from '../../../../core/services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-usuarios',
  imports: [
    CommonModule,
    FormsModule, 
    MatIconModule,
    NgbPagination,
    NgbModule
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios {

  users: any[] = [];
  erroMSG = '';

  constructor(private userService: Users, private authService: AuthService, private router: Router) { }


  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        if (err.status == 401 || err.status === 403) {
          this.authService.logout();
        } else {
          this.erroMSG = 'No se pudieron obtener los usuarios';
        }
      }
    })

  }


  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();   // limpia y redirige
      return;
    }
    this.loadUsers();
  }


  //paginator
searchTerm: string = '';
page = 1;
pageSize = 10;

get filteredUsers() {
  // client-side search
  if (!this.searchTerm) {
    return this.users;
  }

  const term = this.searchTerm.toLowerCase();

  return this.users.filter(u =>
    (u.username?.toLowerCase().includes(term))
  );
}



}
