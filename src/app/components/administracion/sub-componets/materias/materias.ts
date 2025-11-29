import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth-service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig, NgbModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CreateUserModal } from '../../../modals/create-user-modal/create-user-modal';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UsersService } from '../../../../core/services/users';
import { SubjectService } from '../../../../core/services/subject-service';

@Component({
  selector: 'app-materias',
  providers: [NgbModal, NgbModalConfig, CreateUserModal],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    NgbPagination,
    NgbModule],
  templateUrl: './materias.html',
  styleUrl: './materias.css',
})
export class Materias {
 subjects: any[] = [];
  erroMSG = '';
  isLoading = true; // Add loading state
  private usersChangedSubscription!: Subscription; // Declare subscription and mark as definitely assigned

  constructor(
    private subjectSerivice: SubjectService, 
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
    this.loadSubjects();
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.usersChangedSubscription) {
      this.usersChangedSubscription.unsubscribe();
    }
  }



  loadSubjects():void{
    this.isLoading = true;
    this.subjectSerivice.getAllSubject().subscribe({
      next:(data:any) =>{
        this.subjects = data;
        this.isLoading = false;
      }
    })
  }


  //paginator
searchTerm: string = '';
page = 1;
pageSize = 10;

get filteredUsers() {
  // client-side search
  if (!this.searchTerm) {
    return this.subjects;
  }

  const term = this.searchTerm.toLowerCase();

  return this.subjects.filter(u =>
    (u.username?.toLowerCase().includes(term))
  );
}




}
