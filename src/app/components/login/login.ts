import { Component, OnInit, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap'
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { SuccessModal } from '../modals/success-modal/success-modal';
import { ErrorModal } from '../modals/error-modal/error-modal';

@Component({
  selector: 'app-login',
  standalone: true,
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
  providers: [NgbModal, NgbModalConfig, SuccessModal, ErrorModal]
})
export class Login implements OnInit {

  public loginForm!: FormGroup;
  public errorMessage: string = '';

  constructor(private formBuilder: FormBuilder,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: this.formBuilder.control('Admin'),
      password: this.formBuilder.control('admin1234')
    });
  }

  /**
   * Maneja el proceso de inicio de sesión.
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
            console.log('Modal de éxito cerrado con razón:', reason);
          }
        );
      },
      error: (err) => {
        console.error('Fallo de inicio de sesión', err);
        this.errorMessage = err.error?.message || 'Credenciales inválidas. Por favor, intente de nuevo.';
        const modalRef = this.modalService.open(ErrorModal, { centered: true });
        modalRef.componentInstance.errorMessage = this.errorMessage;
      }
    });
  }

  /**
   * Controla la visibilidad de la contraseña.
   */
  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}
