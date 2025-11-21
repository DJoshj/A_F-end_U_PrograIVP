import { Component, OnInit, signal } from '@angular/core';

//angular material
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';

//Nng Boostrap
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap'
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { SuccessModal } from '../modals/success-modal/success-modal';
import { ErrorModal } from '../modals/error-modal/error-modal';

@Component({
  selector: 'app-login',
  imports: [
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatDividerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [NgbModal, NgbModalConfig,SuccessModal,ErrorModal]
})
export class Login implements OnInit {

  public loginForm!: FormGroup;
  public errorMessage: string = '';

  constructor(private formBuilder: FormBuilder,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router) {
    //modal
    config.backdrop = 'static';
    config.keyboard = false;
  }



  ngOnInit(): void {

    this.loginForm = this.formBuilder.group({
      username: this.formBuilder.control('Admin'),
      password: this.formBuilder.control('admin1234')
    });

  }

  //login funciton

  /**
   * Maneja el proceso de inicio de sesión.
   * Temporalmente desactiva el modal de éxito para ir directamente a la página de inicio.
   */
  login(): void {
    this.authService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe({
      next: () => {
        this.modalService.open(SuccessModal, { centered: true }).result.then(
          (result) => {
            if (result === 'confirm') {
              this.router.navigateByUrl('/home');
            }
          },
          (reason) => {
            // Manejar el cierre del modal si es necesario
          }
        );
      },
      error: (err) => {
        console.error('Fallo de inicio de sesión', err); // Registrar el error en consola
        this.errorMessage = err.error?.message || 'Credenciales inválidas. Por favor, intente de nuevo.'; // Mensaje de error
        const modalRef = this.modalService.open(ErrorModal, { centered: true }); // Abrir modal de error
        modalRef.componentInstance.errorMessage = this.errorMessage; // Pasar mensaje de error al modal
      }
    });
  }

  //fin login funtion

  //log out funtion

  //password hide or show
    hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }



}
