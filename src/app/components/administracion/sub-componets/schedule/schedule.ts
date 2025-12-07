import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth-service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ScheduleService } from '../../../../core/services/schedule-service';
import { Schedule } from '../../../../core/models/schedule.model';
import { AssigenedSubjectService } from '../../../../core/services/Assignedsubject-service';
import { ErrorModal } from '../../../modals/error-modal/error-modal';
import { CreateScheduleModal } from '../../../modals/create-schedule-modal/create-schedule-modal';
import { ConfirmDeleteScheduleModal } from '../../../modals/confirm-delete-schedule-modal/confirm-delete-schedule-modal';
import { ScheduleSuccessModal } from '../../../modals/schedule-success-modal/schedule-success-modal';
import { ScheduleDetailsModal } from '../../../modals/schedule-details-modal/schedule-details-modal';

@Component({
  selector: 'app-schedule',
  standalone: true,
  providers: [NgbModal, NgbModalConfig, CreateScheduleModal, ConfirmDeleteScheduleModal, ScheduleSuccessModal, ErrorModal, ScheduleDetailsModal],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    NgbPagination,
    SlicePipe,
  ],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class ScheduleComponent implements OnInit, OnDestroy {
  schedules: Schedule[] = [];
  erroMSG = '';
  isLoading = false;
  searchTerm: string = '';
  page = 1;
  pageSize = 10;
  isScheduleTableVisible: boolean = false;
  distinctDays: string[] = [];

  private schedulesChangedSubscription!: Subscription;

  constructor(
    private scheduleService: ScheduleService,
    private authService: AuthService,
    private router: Router,
    private configM: NgbModalConfig,
    private modalService: NgbModal,
    private assignedSubjectService: AssigenedSubjectService
  ) {
    configM.backdrop = 'static';
    configM.keyboard = false;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
      return;
    }
    this.schedulesChangedSubscription = this.scheduleService.schedulesChanged$.subscribe(() => {
      if (this.isScheduleTableVisible) {
        this.loadSchedules();
      }
    });
    this.isLoading = false;
    this.loadDistinctDays();
  }

  ngOnDestroy(): void {
    if (this.schedulesChangedSubscription) {
      this.schedulesChangedSubscription.unsubscribe();
    }
  }

  /**
   * Carga todos los horarios y verifica si están asignados a alguna materia.
   * Utiliza forkJoin para realizar las llamadas de forma concurrente.
   */
  loadSchedules(): void {
    if (!this.isScheduleTableVisible) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.erroMSG = '';

    forkJoin([
      this.scheduleService.getAllSchedules(),
      this.assignedSubjectService.getAllsubjects()
    ]).subscribe({
      next: ([schedulesData, assignedSubjectsData]) => {
        this.schedules = schedulesData.map(schedule => {
          const isAssigned = assignedSubjectsData.some(assigned =>
            assigned.scheduleId === schedule.scheduleId
          );
          return { ...schedule, available: !isAssigned };
        });
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error al cargar horarios o materias asignadas:', err);
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
        } else {
          this.erroMSG = 'No se pudieron obtener los horarios o las materias asignadas.';
        }
      }
    });
  }

  /**
   * Abre un modal de confirmación para eliminar un horario.
   * @param scheduleId El ID del horario a eliminar.
   * @param isAvailable Indica si el horario está disponible (no asignado).
   */
  deleteSchedule(scheduleId: number, isAvailable: boolean): void {
    if (!isAvailable) {
      this.openErrorModal('No se puede eliminar un horario que está en uso.');
      return;
    }

    const modalRef = this.modalService.open(ConfirmDeleteScheduleModal);
    modalRef.componentInstance.message = '¿Está seguro de que desea eliminar este horario?';

    modalRef.result.then(
      (result) => {
        if (result === 'confirm') {
          this.scheduleService.deleteSchedule(scheduleId).subscribe({
            next: () => {
              this.openSuccessModal('Horario eliminado exitosamente.');
              this.loadSchedules();
            },
            error: (err: any) => {
              console.error('Error al eliminar horario:', err);
              this.openErrorModal('Error al eliminar el horario.');
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
   * Abre el modal para crear un nuevo horario.
   */
  openCreateScheduleModal(): void {
    const modalRef = this.modalService.open(CreateScheduleModal);
    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          this.loadSchedules();
        }
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
      }
    );
  }

  /**
   * Abre el modal para editar un horario existente.
   * @param scheduleId El ID del horario a editar.
   * @param isAvailable Indica si el horario está disponible (no asignado).
   */
  editSchedule(scheduleId: number, isAvailable: boolean): void {
    if (!isAvailable) {
      this.openErrorModal('No se puede editar un horario que está en uso.');
      return;
    }

    const modalRef = this.modalService.open(CreateScheduleModal);
    modalRef.componentInstance.scheduleId = scheduleId;
    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          this.loadSchedules();
        }
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
      }
    );
  }

  /**
   * Realiza la búsqueda de horarios por el día seleccionado en el dropdown.
   * Si no hay término de búsqueda, carga todos los horarios.
   */
  searchSchedules(): void {
    if (!this.searchTerm.trim()) {
      this.loadSchedules();
      return;
    }

    this.isLoading = true;
    this.erroMSG = '';
    this.scheduleService.getSchedulesByDay(this.searchTerm).subscribe({
      next: (data: Schedule[]) => {
        this.schedules = data;
        this.isLoading = false;
        this.isScheduleTableVisible = true;
        if (this.schedules.length === 0) {
          this.erroMSG = 'No se encontraron horarios para ese día.';
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error al buscar horarios:', err);
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
        } else {
          this.erroMSG = 'Error al buscar horarios.';
        }
      },
    });
  }

  /**
   * Alterna la visibilidad de la tabla de horarios.
   * Si se hace visible, carga los horarios. Si se oculta, limpia la lista y el término de búsqueda.
   */
  showAllSchedules(): void {
    this.isScheduleTableVisible = !this.isScheduleTableVisible;
    if (this.isScheduleTableVisible) {
      this.loadSchedules();
    } else {
      this.schedules = [];
      this.searchTerm = '';
      this.isLoading = false;
    }
  }

  /**
   * Abre un modal para mostrar los detalles de un horario asignado.
   * @param scheduleId El ID del horario para ver los detalles.
   */
  viewScheduleDetails(scheduleId: number): void {
    const modalRef = this.modalService.open(ScheduleDetailsModal, { size: 'lg' });
    modalRef.componentInstance.scheduleId = scheduleId;
  }

  /**
   * Getter para obtener los horarios filtrados.
   * Si hay un término de búsqueda (día seleccionado), filtra los horarios.
   * De lo contrario, devuelve todos los horarios.
   */
  get filteredSchedules(): Schedule[] {
    if (!this.searchTerm) {
      return this.schedules;
    }

    const term = this.searchTerm.toLowerCase();
    const filtered = this.schedules.filter(
      (s) => s.days?.toLowerCase().includes(term)
    );
    return filtered;
  }

  /**
   * Abre un modal de error con un mensaje específico.
   * @param message El mensaje de error a mostrar.
   */
  openErrorModal(message: string): void {
    const modalRef = this.modalService.open(ErrorModal);
    modalRef.componentInstance.message = message;
  }

  /**
   * Abre un modal de éxito con un mensaje específico.
   * @param message El mensaje de éxito a mostrar.
   */
  openSuccessModal(message: string): void {
    const modalRef = this.modalService.open(ScheduleSuccessModal);
    modalRef.componentInstance.message = message;
  }

  /**
   * Carga los días distintos de los horarios desde el servicio.
   */
  loadDistinctDays(): void {
    this.scheduleService.getAllDistinctDays().subscribe({
      next: (days: string[]) => {
        this.distinctDays = days;
      },
      error: (err: any) => {
        console.error('Error al obtener días distintos:', err);
      }
    });
  }
}
