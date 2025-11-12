import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../../app/core/services/users'; // Corrected path

@Component({
  selector: 'app-create-user-modal',
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-user-modal.html',
  styles: ``,
  standalone: true
})
export class CreateUserModal implements OnInit {
  createUserForm!: FormGroup;
  userTypes = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Teacher' },
    { id: 3, name: 'Student' }
  ];

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private usersService: UsersService // Inject UsersService
  ) {}

  ngOnInit(): void {
    this.createUserForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      userType: [null, Validators.required] // Add userType form control
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.createUserForm.valid) {
      const { username, email, password, userType } = this.createUserForm.value;
      const userData = {
        username,
        password,
        email,
        state: 'ACTIVE',
        creationDate: '',
        updateDate: ''
      };

      this.usersService.createUser(userData, userType).subscribe({
        next: (response) => {
          console.log('User created successfully', response);
          this.activeModal.close('User created');
        },
        error: (error) => {
          console.error('Error creating user', error);
          // Optionally, display an error message in the modal
        }
      });
    }
  }
}
