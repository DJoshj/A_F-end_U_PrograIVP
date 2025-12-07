import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssigenedSubjectService } from '@app/core/services/Assignedsubject-service';
import { AssignedSchedule } from '@app/core/models/assigned-schedule.model';
import { ErrorModal } from '@app/components/modals/error-modal/error-modal';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-schedule-details-modal',
  standalone: true,
  providers: [NgbModal, AssigenedSubjectService],
  imports: [CommonModule],
  templateUrl: './schedule-details-modal.html',
  styleUrl: './schedule-details-modal.css',
})
export class ScheduleDetailsModal implements OnInit, OnDestroy {
  @Input() scheduleId!: number;
  assignedSubjects: AssignedSchedule[] = [];
  isLoading: boolean = false;
  erroMSG: string = '';
  private assignedSubjectsSubscription!: Subscription;

  constructor(
    private assignedSubjectService: AssigenedSubjectService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    if (this.scheduleId) {
      this.loadAssignedSubjectsForSchedule(this.scheduleId);
    } else {
      this.erroMSG = 'ID de horario no proporcionado.';
    }
  }

  ngOnDestroy(): void {
    if (this.assignedSubjectsSubscription) {
      this.assignedSubjectsSubscription.unsubscribe();
    }
  }

  /**
   * Carga las materias asignadas para un horario específico.
   * @param scheduleId El ID del horario.
   */
  loadAssignedSubjectsForSchedule(scheduleId: number): void {
    this.isLoading = true;
    this.erroMSG = '';
    this.assignedSubjectsSubscription = this.assignedSubjectService.getAllsubjects().subscribe({
      next: (data: AssignedSchedule[]) => {
        this.assignedSubjects = data.filter(assigned => assigned.scheduleId === scheduleId);
        this.isLoading = false;
        if (this.assignedSubjects.length === 0) {
          this.erroMSG = 'No hay materias asignadas para este horario.';
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error al cargar materias asignadas para el horario:', err);
        this.openErrorModal('Error al cargar las materias asignadas.');
      },
    });
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
   * Cierra el modal de detalles.
   */
  closeModal(): void {
    this.activeModal.dismiss('close');
  }
}
