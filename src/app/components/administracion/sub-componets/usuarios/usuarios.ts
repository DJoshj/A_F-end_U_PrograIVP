import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../../../../core/services/users';
import { AuthService } from '../../../../core/services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { CreateUserModal } from '../../../modals/create-user-modal/create-user-modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  providers: [NgbModal, NgbModalConfig, CreateUserModal],
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
export class Usuarios implements OnInit, OnDestroy {
  users: any[] = [];
  erroMSG = '';
  isLoading = true;
  private usersChangedSubscription!: Subscription;

  constructor(
    private userService: UsersService,
    private authService: AuthService,
    private router: Router,
    private configM: NgbModalConfig,
    private modalService: NgbModal
  ) {
    configM.backdrop = 'static';
    configM.keyboard = false;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
      return;
    }
    this.loadUsers();

    this.usersChangedSubscription = this.userService.usersChanged$.subscribe(() => {
      this.loadUsers();
    });
  }

  ngOnDestroy(): void {
    if (this.usersChangedSubscription) {
      this.usersChangedSubscription.unsubscribe();
    }
  }

  /**
   * Carga los usuarios desde el servicio.
   */
  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (data: any) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status == 401 || err.status === 403) {
          this.authService.logout();
        } else {
          this.erroMSG = 'No se pudieron obtener los usuarios';
        }
      }
    })

  }

  /**
   * Navega a la página de edición de usuario.
   * @param usuario El objeto de usuario.
   */
  UsuarioInfo(usuario: any) {
    this.router.navigate(['/home/administracion/editaUsuario', usuario.username]);
  }

  /**
   * Abre el modal para crear un nuevo usuario.
   */
  openCreateUserModal() {
    const modalRef = this.modalService.open(CreateUserModal, { centered: true });
    modalRef.result.then((result) => {
      if (result === 'User created') {
        this.userService.notifyUsersChanged();
      }
    }, (reason) => {
      console.log('Modal de creación de usuario cerrado con razón:', reason);
    });
  }

  searchTerm: string = '';
  page = 1;
  pageSize = 10;

  /**
   * Getter para obtener los usuarios filtrados por término de búsqueda.
   */
  get filteredUsers() {
    if (!this.searchTerm) {
      return this.users;
    }

    const term = this.searchTerm.toLowerCase();

    return this.users.filter(u =>
      (u.username?.toLowerCase().includes(term))
    );
  }
}
