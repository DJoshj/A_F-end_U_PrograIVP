import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";
import { AuthService } from '../../../../core/services/auth-service';
import { Router } from '@angular/router';
import { NgbModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-mostrar-estudiantes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    NgbModule
  ],
  templateUrl: './mostrar-estudiantes.html',
  styleUrl: './mostrar-estudiantes.css',
})
export class MostrarEstudiantes implements OnInit {


  constructor( private authService: AuthService, private router: Router) { }


  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
      return;
    }
  }
}
