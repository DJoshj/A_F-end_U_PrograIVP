import { Component, OnInit } from '@angular/core';

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
import { Auth } from '../../services/auth';
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


  public loginForm!: FormGroup;

  constructor(private formBuilder: FormBuilder,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private authService:AuthService,
    private router: Router) {
    //modal
    config.backdrop = 'static';
    config.keyboard = false;
  }



  ngOnInit(): void {

    this.loginForm = this.formBuilder.group({
      username: this.formBuilder.control(''),
      password: this.formBuilder.control('')
    });

  }

  //login funciton

  login(content: any): void {


    this.authService.login(this.loginForm.value.username,this.loginForm.value.password).subscribe({
      next:()=> this.router.navigateByUrl('/home,'),
      error: (err) => console.error('login Failed',err)
    })

    // if(auth==true){
    // this.modalService.open(content); //alert
    // this.router.navigateByUrl('/home');
    // }

  }

  //fin login funtion


  //back end ogin

}
