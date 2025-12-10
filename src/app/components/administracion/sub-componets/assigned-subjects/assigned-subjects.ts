import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AssigenedSubjectService } from '../../../../core/services/Assignedsubject-service';
import { ErrorModal } from '@app/components/modals/error-modal/error-modal';
import { SuccessModal } from '@app/components/modals/success-modal/success-modal';

@Component({
  selector: 'app-assigned-subjects',
  standalone: true,
  providers: [NgbModal, NgbModalConfig, ErrorModal, SuccessModal],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    NgbPagination
  ],
  templateUrl: './assigned-subjects.html',
  styleUrl: './assigned-subjects.css',
})
export class AssignedSubjects implements OnInit, OnDestroy {
  subjects: any[] = [];
  allAssignedSubjects: any[] = [];
  erroMSG = '';
  isLoading = false;
  showTable: boolean = false;
  searchTerm: string = '';
  page = 1;
  pageSize = 10;

  private subjectsChangedSubscription!: Subscription;

  constructor(
    private assigenedSubjectService: AssigenedSubjectService,
    private authService: AuthService,
    public router: Router, // Changed to public
    private modalService: NgbModal,
    private configM: NgbModalConfig
  ) {
    configM.backdrop = 'static';
    configM.keyboard = false;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
      return;
    }

    this.subjectsChangedSubscription = this.assigenedSubjectService.subjectsChanged$.subscribe(() => {
      this.loadSubjects();
    });
  }

  ngOnDestroy(): void {
    if (this.subjectsChangedSubscription) {
      this.subjectsChangedSubscription.unsubscribe();
    }
  }

  /**
   * Carga todas las materias asignadas desde el servicio.
   */
  loadSubjects(): void {
    this.isLoading = true;
    this.erroMSG = '';
    this.assigenedSubjectService.getAllsubjects().subscribe({
      next: (data: any) => {
        this.allAssignedSubjects = data;
        this.subjects = data;
        this.isLoading = false;
        this.showTable = true;
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
        } else {
          this.erroMSG = 'No se pudieron obtener las materias asignadas.';
        }
      },
    });
  }

  /**
   * Edita una materia asignada.
   * @param subjectAssignedId El ID de la materia asignada a editar.
   */
  editSubject(subjectAssignedId: number) {
    this.router.navigate(['/home/administracion/asignarSubject', subjectAssignedId]);
  }

  /**
   * Busca materias asignadas por término de búsqueda (nombre de materia o código).
   */
  searchAssignedSubjects(): void {
    if (!this.searchTerm.trim()) {
      this.openErrorModal('Por favor, ingrese un término de búsqueda.');
      return;
    }

    this.isLoading = true;
    this.erroMSG = '';
    const term = this.searchTerm.toLowerCase();

    this.subjects = this.allAssignedSubjects.filter(
      (s) =>
        s.subjectName?.toLowerCase().includes(term) ||
        s.subjectCode?.toLowerCase().includes(term)
    );

    this.isLoading = false;
    this.showTable = true;
    if (this.subjects.length === 0) {
      this.erroMSG = 'No se encontraron materias asignadas con ese término.';
    }
  }

  /**
   * Alterna la visibilidad de la tabla y carga/limpia datos.
   */
  toggleShowAllAssignedSubjects(): void {
    if (this.showTable) {
      this.showTable = false;
      this.subjects = [];
      this.searchTerm = '';
    } else {
      this.loadSubjects();
    }
  }

  /**
   * Propiedad computada para filtrar materias asignadas en el lado del cliente (para paginación).
   */
  get filteredAssignedSubjects() {
    return this.subjects;
  }

  /**
   * Abre un modal de error.
   * @param message El mensaje de error a mostrar.
   */
  openErrorModal(message: string): void {
    const modalRef = this.modalService.open(ErrorModal);
    modalRef.componentInstance.message = message;
  }

  /**
   * Abre un modal de éxito.
   * @param message El mensaje de éxito a mostrar.
   */
  openSuccessModal(message: string): void {
    const modalRef = this.modalService.open(SuccessModal);
    modalRef.componentInstance.message = message;
  }
}
