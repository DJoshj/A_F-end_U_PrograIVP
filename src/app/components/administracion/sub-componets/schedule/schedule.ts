// schedule.ts
// Componente para la gestión de horarios.
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth-service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgbModal, NgbModalConfig, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ScheduleService } from '../../../../core/services/schedule-service';
import { Schedule } from '../../../../core/models/schedule.model';
import { AssignedSchedule } from '../../../../core/models/assigned-schedule.model';
import { AssigenedSubjectService } from '../../../../core/services/Assignedsubject-service';
import { ErrorModal } from '../../../modals/error-modal/error-modal';
import { CreateScheduleModal } from '../../../modals/create-schedule-modal/create-schedule-modal';
import { ConfirmDeleteScheduleModal } from '../../../modals/confirm-delete-schedule-modal/confirm-delete-schedule-modal';
import { ScheduleSuccessModal } from '../../../modals/schedule-success-modal/schedule-success-modal';
import { AssignedScheduleDetailsComponent } from './sub-components/assigned-schedule-details/assigned-schedule-details'; // Import the sub-component
import { Input } from '@angular/core'; // Import Input

@Component({
  selector: 'app-schedule',
  standalone: true,
  providers: [NgbModal, NgbModalConfig, CreateScheduleModal, ConfirmDeleteScheduleModal, ScheduleSuccessModal, ErrorModal,RouterLink,RouterOutlet,
],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    NgbPagination,
    SlicePipe,
    AssignedScheduleDetailsComponent // Add the sub-component to imports
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
  isScheduleTableVisible: boolean = false; // Controla la visibilidad de la tabla de horarios
  selectedScheduleId: number | null = null; // Stores the ID of the schedule whose details are being viewed
  showAssignedScheduleDetails: boolean = false; // Controls the visibility of the assigned-schedule-details component

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
      if (this.isScheduleTableVisible) { // Only load if table is visible
        this.loadSchedules();
      }
    });
    this.isLoading = false; // Ensure loading is false on initial load
  }

  ngOnDestroy(): void {
    if (this.schedulesChangedSubscription) {
      this.schedulesChangedSubscription.unsubscribe();
    }
  }

  loadSchedules(): void {
    if (!this.isScheduleTableVisible) {
      this.isLoading = false; // Ensure loading is false if table is not visible
      return;
    }
    this.isLoading = true;
    this.erroMSG = '';
    this.scheduleService.getAllSchedules().subscribe({
      next: (schedulesData: Schedule[]) => {
        this.assignedSubjectService.getAllsubjects().subscribe({
          next: (assignedSubjectsData: AssignedSchedule[]) => {
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
            console.error('Error al obtener materias asignadas:', err);
            if (err.status === 401 || err.status === 403) {
              this.authService.logout();
            } else {
              this.erroMSG = 'No se pudieron obtener las materias asignadas.';
            }
          }
        });
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
        } else {
          this.erroMSG = 'No se pudieron obtener los horarios.';
        }
      },
    });
  }

  deleteSchedule(scheduleId: number): void {
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

  editSchedule(scheduleId: number): void {
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

  searchSchedules(): void {
    if (!this.searchTerm.trim()) {
      this.openErrorModal('Por favor, ingrese un día para buscar.');
      this.isLoading = false; // Ensure loading is false if no search term
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
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
        } else {
          this.erroMSG = 'Error al buscar horarios.';
        }
      },
    });
  }

  showAllSchedules(): void {
    this.isScheduleTableVisible = !this.isScheduleTableVisible;
    if (this.isScheduleTableVisible) {
      this.loadSchedules();
    } else {
      this.schedules = [];
      this.searchTerm = '';
      this.isLoading = false; // Ensure isLoading is false when hiding the table
    }
  }

  viewScheduleDetails(scheduleId: number): void {
    this.selectedScheduleId = scheduleId;
    this.showAssignedScheduleDetails = true;
  }

  hideScheduleDetails(): void {
    this.selectedScheduleId = null;
    this.showAssignedScheduleDetails = false;
  }

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

  openErrorModal(message: string): void {
    const modalRef = this.modalService.open(ErrorModal);
    modalRef.componentInstance.message = message;
  }

  openSuccessModal(message: string): void {
    const modalRef = this.modalService.open(ScheduleSuccessModal);
    modalRef.componentInstance.message = message;
  }
}
