import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../../core/services/users';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Importar MatSnackBar y MatSnackBarModule

@Component({
  selector: 'app-editar-usuario',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule, // Añadir MatIconModule a los imports
    MatSnackBarModule // Añadir MatSnackBarModule a los imports
  ],
  templateUrl: './editar-usuario.html',
  styleUrl: './editar-usuario.css',
})
export class EditarUsuario implements OnInit {
  username: string | null = null;
  user: any;
  erroMSG: string = '';
  isLoading = true; // Propiedad para controlar el estado de carga
  successMessage: string = ''; // Propiedad para mostrar mensaje de éxito

  constructor(
    private route: ActivatedRoute,
    private userService: UsersService,
    public router: Router,
    private snackBar: MatSnackBar // Inyectar MatSnackBar
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
   * Actualiza los datos del usuario.
   */
  updateUser(): void {
    if (this.user && this.user.userId) {
      this.isLoading = true;
      this.userService.updateUser(this.user.userId, this.user).subscribe({
        next: () => {
          this.successMessage = 'Usuario actualizado exitosamente.';
          this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', {
            duration: 3000,
          });
          this.isLoading = false;
        },
        error: (err: any) => {
          this.erroMSG = 'Error al actualizar el usuario: ' + err.message;
          this.snackBar.open('Error al actualizar el usuario', 'Cerrar', {
            duration: 3000,
          });
          console.error('Error al actualizar el usuario:', err);
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Elimina el usuario actual.
   */
  deleteUser(): void {
    if (this.user && this.user.userId) {
      if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
        this.isLoading = true;
        this.userService.deleteUser(this.user.userId).subscribe({
          next: () => {
            this.snackBar.open('Usuario eliminado exitosamente', 'Cerrar', {
              duration: 3000,
            });
            this.router.navigate(['/home/administracion/usuarios']); // Redirigir a la página de usuarios
            this.isLoading = false;
          },
          error: (err: any) => {
            this.erroMSG = 'Error al eliminar el usuario: ' + err.message;
            this.snackBar.open('Error al eliminar el usuario', 'Cerrar', {
              duration: 3000,
            });
            console.error('Error al eliminar el usuario:', err);
            this.isLoading = false;
          }
        });
      }
    }
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
