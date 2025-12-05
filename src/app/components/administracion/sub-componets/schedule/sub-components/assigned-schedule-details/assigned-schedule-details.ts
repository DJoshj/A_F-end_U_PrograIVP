// assigned-schedule-details.ts
// Componente para mostrar las materias y aulas asignadas a un horario específico.
import { Component, OnInit, OnDestroy, Input } from '@angular/core'; // Import Input
import { CommonModule } from '@angular/common';
import { AssigenedSubjectService } from '@app/core/services/Assignedsubject-service';
import { AssignedSchedule } from '@app/core/models/assigned-schedule.model';
import { ErrorModal } from '@app/components/modals/error-modal/error-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-assigned-schedule-details',
  standalone: true,
  providers: [NgbModal, AssigenedSubjectService],
  imports: [CommonModule],
  templateUrl: './assigned-schedule-details.html',
  styleUrl: './assigned-schedule-details.css',
})
export class AssignedScheduleDetailsComponent implements OnInit, OnDestroy {
  @Input() scheduleId!: number; // Make scheduleId an Input property
  assignedSubjects: AssignedSchedule[] = [];
  isLoading: boolean = false;
  erroMSG: string = '';
  private assignedSubjectsSubscription!: Subscription; // Renamed for clarity

  constructor(
    private assignedSubjectService: AssigenedSubjectService,
    private modalService: NgbModal
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

  openErrorModal(message: string): void {
    const modalRef = this.modalService.open(ErrorModal);
    modalRef.componentInstance.message = message;
  }
}
