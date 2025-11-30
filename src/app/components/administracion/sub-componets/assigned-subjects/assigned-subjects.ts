import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap'; // Eliminar NgbModule
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs'; // Import Subscription
import { AssigenedSubjectService } from '../../../../core/services/Assignedsubject-service';
import { ErrorModal } from '@app/components/modals/error-modal/error-modal'; // Importar ErrorModal
import { SuccessModal } from '@app/components/modals/success-modal/success-modal'; // Importar SuccessModal

@Component({
  selector: 'app-assigned-subjects',
  standalone: true, // Marcar como standalone
  providers: [NgbModal, NgbModalConfig,ErrorModal,SuccessModal],
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
  allAssignedSubjects: any[] = []; // Para guardar todas las materias asignadas sin filtrar
  erroMSG = '';
  isLoading = false; // Inicialmente no está cargando
  showTable: boolean = false; // Controla la visibilidad de la tabla
  searchTerm: string = '';
  page = 1;
  pageSize = 10;

  private subjectsChangedSubscription!: Subscription; // Suscripción para cambios en materias

  constructor(
    private assigenedSubjectService: AssigenedSubjectService,
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal, // Inyectar NgbModal
    private configM: NgbModalConfig // Inyectar NgbModalConfig
  ) {
    configM.backdrop = 'static';
    configM.keyboard = false;
  }

  ngOnInit(): void {
    // Verificar autenticación al iniciar el componente
    if (!this.authService.isAuthenticated()) {
      this.authService.logout(); // Limpia y redirige si no está autenticado
      return;
    }

    // Suscribirse a los cambios en las materias para recargar la lista
    this.subjectsChangedSubscription = this.assigenedSubjectService.subjectsChanged$.subscribe(() => {
      this.loadSubjects();
    });
  }

  ngOnDestroy(): void {
    // Desuscribirse para evitar fugas de memoria
    if (this.subjectsChangedSubscription) {
      this.subjectsChangedSubscription.unsubscribe();
    }
  }

  // Cargar todas las materias asignadas desde el servicio
  loadSubjects(): void {
    this.isLoading = true;
    this.erroMSG = ''; // Limpiar mensajes de error previos
    this.assigenedSubjectService.getAllsubjects().subscribe({
      next: (data: any) => {
        this.allAssignedSubjects = data; // Guardar todas las materias asignadas
        this.subjects = data; // Inicialmente, mostrar todas
        this.isLoading = false;
        this.showTable = true; // Mostrar la tabla después de cargar
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.authService.logout(); // Redirigir si hay problemas de autenticación/autorización
        } else {
          this.erroMSG = 'No se pudieron obtener las materias asignadas.';
        }
      },
    });
  }

  // Editar una materia asignada
  editSubject(subjectAssignedId: number) {
    this.router.navigate(['/home/administracion/asignarSubject', subjectAssignedId]);
  }

  // Buscar materias asignadas por término de búsqueda (nombre de materia o código)
  searchAssignedSubjects(): void {
    if (!this.searchTerm.trim()) {
      this.openErrorModal('Por favor, ingrese un término de búsqueda.');
      return;
    }

    this.isLoading = true;
    this.erroMSG = '';
    const term = this.searchTerm.toLowerCase();

    // Filtrar en el lado del cliente
    this.subjects = this.allAssignedSubjects.filter(
      (s) =>
        s.subjectName?.toLowerCase().includes(term) ||
        s.subjectCode?.toLowerCase().includes(term) // Asumiendo que SubjectAssignedDTO tiene subjectCode
    );

    this.isLoading = false;
    this.showTable = true; // Mostrar la tabla con los resultados de la búsqueda
    if (this.subjects.length === 0) {
      this.erroMSG = 'No se encontraron materias asignadas con ese término.';
    }
  }

  // Alternar la visibilidad de la tabla y cargar/limpiar datos
  toggleShowAllAssignedSubjects(): void {
    if (this.showTable) {
      this.showTable = false;
      this.subjects = []; // Limpiar la lista cuando se oculta
      this.searchTerm = ''; // Limpiar el término de búsqueda
    } else {
      this.loadSubjects(); // Cargar todas las materias cuando se muestra
    }
  }

  // Propiedad computada para filtrar materias asignadas en el lado del cliente (para paginación)
  get filteredAssignedSubjects() {
    // La búsqueda ya se realiza en searchAssignedSubjects, aquí solo se usa para paginación
    return this.subjects;
  }

  // Abrir modal de error
  openErrorModal(message: string): void {
    const modalRef = this.modalService.open(ErrorModal);
    modalRef.componentInstance.message = message;
  }

  // Abrir modal de éxito
  openSuccessModal(message: string): void {
    const modalRef = this.modalService.open(SuccessModal);
    modalRef.componentInstance.message = message;
  }
}
