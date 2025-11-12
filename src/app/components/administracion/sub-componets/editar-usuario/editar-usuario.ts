import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../../core/services/users';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-usuario',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './editar-usuario.html',
  styleUrl: './editar-usuario.css',
})
export class EditarUsuario implements OnInit {
  username: string | null = null;
  user: any;
  erroMSG: string = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UsersService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.username = params.get('username');
      if (this.username) {
        this.loadUser(this.username);
      } else {
        this.erroMSG = 'No se proporcionó nombre de usuario.';
      }
    });
  }

  loadUser(username: string): void {
    this.userService.getUserByUsername(username).subscribe({
      next: (data: any) => {
        if (data) {
          this.user = data;
        } else {
          this.erroMSG = 'Usuario no encontrado.';
        }
      },
      error: (err: any) => {
        this.erroMSG = 'Error al cargar el usuario: ' + err.message;
        console.error('Error al cargar el usuario:', err);
      }
    });
  }
}
