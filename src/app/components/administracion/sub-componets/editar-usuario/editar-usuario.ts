import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../../core/services/users';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon'; // Importar MatIconModule

@Component({
  selector: 'app-editar-usuario',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule // Añadir MatIconModule a los imports
  ],
  templateUrl: './editar-usuario.html',
  styleUrl: './editar-usuario.css',
})
export class EditarUsuario implements OnInit {
  username: string | null = null;
  user: any;
  erroMSG: string = '';
  isLoading = true; // Propiedad para controlar el estado de carga

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
        this.erroMSG = 'No se proporcionó nombre de usuario.'; // Mensaje de error si no hay nombre de usuario
        this.isLoading = false; // Finalizar carga si no hay nombre de usuario
      }
    });
  }

  /**
   * Carga los datos de un usuario específico.
   * @param username El nombre de usuario a cargar.
   */
  loadUser(username: string): void {
    this.isLoading = true; // Indicar que se está cargando
    this.userService.getUserByUsername(username).subscribe({
      next: (data: any) => {
        if (data) {
          this.user = data;
        } else {
          this.erroMSG = 'Usuario no encontrado.'; // Mensaje si el usuario no existe
        }
        this.isLoading = false; // Finalizar carga
      },
      error: (err: any) => {
        this.erroMSG = 'Error al cargar el usuario: ' + err.message; // Mensaje de error
        console.error('Error al cargar el usuario:', err);
        this.isLoading = false; // Finalizar carga
      }
    });
  }
}
