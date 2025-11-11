import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

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

@Component({
  selector: 'app-login',
  imports: [
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatDividerModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [NgbModal, NgbModalConfig]
})
export class Login implements OnInit {

  @ViewChild('successModal') successModal!: ElementRef;
  @ViewChild('errorModal') errorModal!: ElementRef;

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
      username: this.formBuilder.control('Kaisy'),
      password: this.formBuilder.control('kaisy')
    });

  }

  //login funciton

  login(): void {
    this.authService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe({
      next: () => {
        this.modalService.open(this.successModal, { centered: true }).result.then(
          (result) => {
            if (result === 'confirm') {
              this.router.navigateByUrl('/home');
            }
          },
          (reason) => {
            // Handle modal dismiss if needed
          }
        );
      },
      error: (err) => {
        console.error('Login Failed', err);
        this.errorMessage = err.error?.message || 'Credenciales invalidas. Por favor, intente de nuevo.';
        this.modalService.open(this.errorModal, { centered: true });
      }
    });
  }

  //fin login funtion

  //log out funtion


}
