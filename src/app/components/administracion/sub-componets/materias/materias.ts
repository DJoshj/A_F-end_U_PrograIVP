import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth-service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SubjectService } from '../../../../core/services/subject-service';
import { CreateSubjectModal } from '@app/components/modals/create-subject-modal/create-subject-modal';
import { ErrorModal } from '@app/components/modals/error-modal/error-modal';
import { SubjectDeleteSuccessModal } from '@app/components/modals/subject-delete-success-modal/subject-delete-success-modal';
import { ConfirmDeleteSubjectModal } from '@app/components/modals/confirm-delete-subject-modal/confirm-delete-subject-modal';

@Component({
  selector: 'app-materias',
  standalone: true,
  providers: [NgbModal, NgbModalConfig, CreateSubjectModal, ErrorModal, SubjectDeleteSuccessModal, ConfirmDeleteSubjectModal],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    NgbPagination,
  ],
  templateUrl: './materias.html',
  styleUrl: './materias.css',
})
export class Materias implements OnInit, OnDestroy {
  subjects: any[] = [];
  erroMSG = '';
  isLoading = false;
  showTable: boolean = false;
  searchTerm: string = '';
  page = 1;
  pageSize = 10;

  private subjectsChangedSubscription!: Subscription;

  constructor(
    private subjectService: SubjectService,
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

    this.subjectsChangedSubscription = this.subjectService.subjectsChanged$.subscribe(() => {
      this.loadSubjects();
    });
  }

  ngOnDestroy(): void {
    if (this.subjectsChangedSubscription) {
      this.subjectsChangedSubscription.unsubscribe();
    }
  }

  /**
   * Carga todas las materias desde el servicio.
   */
  loadSubjects(): void {
    this.isLoading = true;
    this.erroMSG = '';
    this.subjectService.getAllSubject().subscribe({
      next: (data: any) => {
        this.subjects = data;
        this.isLoading = false;
        this.showTable = true;
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
        } else {
          this.erroMSG = 'No se pudieron obtener las materias.';
        }
      },
    });
  }

  /**
   * Elimina una materia por su ID (ahora con modal de confirmación).
   * @param subjectId El ID de la materia a eliminar.
   */
  deleteSubject(subjectId: number): void {
    const modalRef = this.modalService.open(ConfirmDeleteSubjectModal);
    modalRef.componentInstance.message = '¿Está seguro de que desea eliminar esta materia?';

    modalRef.result.then(
      (result) => {
        if (result === 'confirm') {
          this.subjectService.deleteSubject(subjectId).subscribe({
            next: () => {
              this.openDeleteSuccessModal('Materia eliminada exitosamente.');
              this.loadSubjects();
            },
            error: (err: any) => {
              console.error('Error al eliminar materia:', err);
              this.openErrorModal('Error al eliminar la materia.');
            },
          });
        }
      },
      (reason) => {
        console.log('Modal de confirmación de eliminación cerrado con razón:', reason);
      }
    );
  }

  /**
   * Abre el modal para crear una nueva materia.
   */
  openCreateSubjectModal(): void {
    const modalRef = this.modalService.open(CreateSubjectModal);
    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          this.loadSubjects();
        }
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
      }
    );
  }

  /**
   * Busca materias por término de búsqueda.
   */
  searchSubjects(): void {
    if (!this.searchTerm.trim()) {
      this.openErrorModal('Por favor, ingrese un término de búsqueda.');
      return;
    }

    this.isLoading = true;
    this.erroMSG = '';
    this.subjectService.searchSubjectByCode(this.searchTerm).subscribe({
      next: (data: any) => {
        this.subjects = data;
        this.isLoading = false;
        this.showTable = true;
        if (this.subjects.length === 0) {
          this.erroMSG = 'No se encontraron materias con ese código.';
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
        } else {
          this.erroMSG = 'Error al buscar materias.';
        }
      },
    });
  }

  /**
   * Muestra todas las materias o las oculta.
   */
  showAllSubjects(): void {
    if (this.showTable) {
      this.showTable = false;
      this.subjects = [];
      this.searchTerm = '';
    } else {
      this.loadSubjects();
    }
  }

  /**
   * Propiedad computada para filtrar materias en el lado del cliente (para paginación).
   */
  get filteredSubjects() {
    if (!this.searchTerm) {
      return this.subjects;
    }

    const term = this.searchTerm.toLowerCase();

    return this.subjects.filter(
      (s) =>
        s.subjectCode?.toLowerCase().includes(term) ||
        s.name?.toLowerCase().includes(term)
    );
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
   * Abre un modal de éxito de eliminación de materia.
   * @param message El mensaje de éxito a mostrar.
   */
  openDeleteSuccessModal(message: string): void {
    const modalRef = this.modalService.open(SubjectDeleteSuccessModal);
    modalRef.componentInstance.message = message;
  }
}
