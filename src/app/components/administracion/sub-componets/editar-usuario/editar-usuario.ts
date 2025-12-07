import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../../core/services/users';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './editar-usuario.html',
  styleUrl: './editar-usuario.css',
})
export class EditarUsuario implements OnInit {
  username: string | null = null;
  user: any;
  erroMSG: string = '';
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private userService: UsersService,
    public router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.username = params.get('username');
      if (this.username) {
        this.loadUser(this.username);
      } else {
        this.erroMSG = 'No se proporcionó nombre de usuario.';
        this.isLoading = false;
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
            this.router.navigate(['/home/administracion/usuarios']);
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
    this.isLoading = true;
    this.userService.getUserByUsername(username).subscribe({
      next: (data: any) => {
        if (data) {
          this.user = data;
        } else {
          this.erroMSG = 'Usuario no encontrado.';
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.erroMSG = 'Error al cargar el usuario: ' + err.message;
        console.error('Error al cargar el usuario:', err);
        this.isLoading = false;
      }
    });
  }
}
