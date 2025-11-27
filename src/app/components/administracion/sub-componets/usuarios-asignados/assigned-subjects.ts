import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, Router } from '@angular/router';
import { UsersService } from '../../../../core/services/users';
import { AuthService } from '../../../../core/services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbModule, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { CreateUserModal } from '../../../modals/create-user-modal/create-user-modal';
import { Subscription } from 'rxjs'; // Import Subscription
import { SubjectService } from '../../../../core/services/subject-service';

@Component({
  selector: 'app-assigned-subjects',
  providers: [NgbModal, NgbModalConfig, CreateUserModal],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    NgbPagination,
    NgbModule],
  templateUrl: './assigned-subjects.html',
  styleUrl: './assigned-subjects.css',
})
export class AssignedSubjects implements OnInit, OnDestroy {

  subjects: any[] = [];
  erroMSG = '';
  isLoading = true; // Add loading state
  private usersChangedSubscription!: Subscription; // Declare subscription and mark as definitely assigned

  constructor(private subjectService: SubjectService,
    private authService: AuthService,
    private router: Router) {

  }

  ngOnInit(): void {

    if (!this.authService.isAuthenticated()) {
      this.authService.logout();   // limpia y redirige
      return;
    }
    this.loadSubjects();

    // Se subscribe al evento de cambio de los subjects
    this.usersChangedSubscription = this.subjectService.subjectsChanged$.subscribe(() => {
      this.loadSubjects();
    });
  }


  ngOnDestroy(): void {
    // desubscribe para evitar filtraciones en memoria
    if (this.usersChangedSubscription) {
      this.usersChangedSubscription.unsubscribe();
    }
  }

  //load subjects

  loadSubjects(): void {
    this.isLoading = true;
    this.subjectService.getAllsubjects().subscribe({
      next: (data: any) => {
        console.log('Subjects data:', data); // Add console log here
        this.subjects = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status == 401 || err.status === 403) {
          this.authService.logout();
        } else {
          this.erroMSG = 'No se pudieron obtener los usuarios'

        }
      }
    })

  }

  //fin load Horaios


  editSubject(subjectAssignedId: number) {
    this.router.navigate(['/home/administracion/asignarSubject', subjectAssignedId]);
  }

  //paginator
searchTerm: string = '';
page = 1;
pageSize = 10;

get filteredSubsjects() {
  // client-side search
  if (!this.searchTerm) {
    return this.subjects;
  }

  const term = this.searchTerm.toLowerCase();

  return this.subjects.filter(s =>
    (s.subjectName?.toLowerCase().includes(term)) 
  );
}




}
