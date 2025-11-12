import { Component, OnInit, OnDestroy } from '@angular/core'; // Import OnInit and OnDestroy
import { RouterOutlet,RouterLinkWithHref, Router } from '@angular/router';
import { UsersService } from '../../../../core/services/users';
import { AuthService } from '../../../../core/services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal,NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { CreateUserModal } from '../../../modals/create-user-modal/create-user-modal';
import { Subscription } from 'rxjs'; // Import Subscription

@Component({
  selector: 'app-usuarios',
  providers:[NgbModal, NgbModalConfig,CreateUserModal ],
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
export class Usuarios implements OnInit, OnDestroy { // Implement OnInit and OnDestroy
  users: any[] = [];
  erroMSG = '';
  isLoading = true; // Add loading state
  private usersChangedSubscription!: Subscription; // Declare subscription and mark as definitely assigned

  constructor(
    private userService: UsersService, 
    private authService: AuthService, 
    private router: Router,
    private configM:NgbModalConfig,
    private modalService:NgbModal  
  ) {
    configM.backdrop= 'static';
    configM.keyboard = false;
   }
  
  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();   // limpia y redirige
      return;
    }
    this.loadUsers();

    // Subscribe to usersChanged event
    this.usersChangedSubscription = this.userService.usersChanged$.subscribe(() => {
      this.loadUsers();
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.usersChangedSubscription) {
      this.usersChangedSubscription.unsubscribe();
    }
  }

  //load users
  loadUsers(): void {
    this.isLoading = true; // Set loading to true before fetching
    this.userService.getUsers().subscribe({
      next: (data: any) => {
        this.users = data;
        this.isLoading = false; // Set loading to false on success
      },
      error: (err: any) => {
        this.isLoading = false; // Set loading to false on error
        if (err.status == 401 || err.status === 403) {
          this.authService.logout();
        } else {
          this.erroMSG = 'No se pudieron obtener los usuarios';
        }
      }
    })

  }


  //listar estudiante independiente
  UsuarioInfo(usuario: any) {
    this.router.navigate(['/home/administracion/editaUsuario', usuario.username]);
  }

  

  //para modificar estudiantes de momento solo retorna el modal
	open() {
		const modalRef = this.modalService.open(CreateUserModal, { centered: true });
    modalRef.result.then((result) => {
      if (result === 'User created') {
        this.userService.notifyUsersChanged(); // Notify after successful user creation
      }
    }, (reason) => {
      // Handle modal dismiss if needed
    });
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
