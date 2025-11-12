import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { MatIconModule } from "@angular/material/icon";
import { AuthService } from '../../../../core/services/auth-service';
import { Router } from '@angular/router';
import { NgbModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-mostrar-estudiantes',
  imports: [
    CommonModule,
    FormsModule, // Add FormsModule here
    MatIconModule,
    NgbModule
],
  templateUrl: './mostrar-estudiantes.html',
  styleUrl: './mostrar-estudiantes.css',
})
export class MostrarEstudiantes implements OnInit {


  constructor( private authService: AuthService, private router: Router) { }



  ngOnInit(): void {

  }






}
