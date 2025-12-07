// create-schedule-modal.ts
// Modal para crear o editar un horario.
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScheduleDTO, Schedule } from '../../../core/models/schedule.model';
import { ScheduleService } from '../../../core/services/schedule-service';
import { ErrorModal } from '../error-modal/error-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ScheduleSuccessModal } from '../schedule-success-modal/schedule-success-modal';

@Component({
  selector: 'app-create-schedule-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-schedule-modal.html',
  styleUrl: './create-schedule-modal.css',
})
export class CreateScheduleModal implements OnInit {
  @Input() scheduleId: number | null = null; // Para edición
  
  // Propiedades locales para el formulario
  dayInput: string = '';
  startTimeInput: string = '';
  endTimeInput: string = '';
  availableInput: boolean = true; // Mantener para la UI, pero no se envía al DTO del backend

  title: string = 'Crear Nuevo Horario';
  isEditMode: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private scheduleService: ScheduleService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    if (this.scheduleId) {
      this.isEditMode = true;
      this.title = 'Editar Horario';
      this.loadScheduleForEdit(this.scheduleId);
    }
  }

  // Carga los datos del horario para edición
  loadScheduleForEdit(id: number): void {
    this.scheduleService.getScheduleById(id).subscribe({
      next: (data: Schedule) => {
        this.dayInput = data.days;
        const [startTime, endTime] = data.schedule.split('-');
        this.startTimeInput = startTime;
        this.endTimeInput = endTime;
        this.availableInput = data.available; // Asumiendo que 'available' viene en el ScheduleResponseDTO
      },
      error: (err: any) => {
        console.error('Error al cargar horario para edición:', err);
        this.openErrorModal('Error al cargar los datos del horario.');
        this.activeModal.dismiss('error');
      },
    });
  }

  // Guarda el horario (crea o actualiza)
  saveSchedule(): void {
    // Validar que la hora de inicio no sea mayor o igual que la hora de fin
    if (this.startTimeInput && this.endTimeInput) {
      const [startHour, startMinute] = this.startTimeInput.split(':').map(Number);
      const [endHour, endMinute] = this.endTimeInput.split(':').map(Number);

      if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
        this.openErrorModal('La hora de inicio no puede ser mayor o igual que la hora de fin.');
        return;
      }
    }


    // Construir el DTO para el backend
    const scheduleDTO: ScheduleDTO = {
      days: this.dayInput,
      schedule: `${this.startTimeInput}-${this.endTimeInput}`,
    };

    console.log('CreateScheduleModal: Attempting to save schedule:', scheduleDTO);

    if (this.isEditMode && this.scheduleId) {
      this.scheduleService.updateSchedule(this.scheduleId, scheduleDTO).subscribe({
        next: (response) => {
          console.log('CreateScheduleModal: Schedule updated successfully:', response);
          this.openSuccessModal('Horario actualizado exitosamente.');
          this.activeModal.close('success');
        },
        error: (err: any) => {
          console.error('CreateScheduleModal: Error al actualizar horario:', err);
          this.openErrorModal(`Error al actualizar el horario: ${err.error?.message || err.message}`);
        },
      });
    } else {
      this.scheduleService.createSchedule(scheduleDTO).subscribe({
        next: (response) => {
          console.log('CreateScheduleModal: Schedule created successfully:', response);
          this.openSuccessModal('Horario creado exitosamente.');
          this.activeModal.close('success');
        },
        error: (err: any) => {
          console.error('CreateScheduleModal: Error al crear horario:', err);
          this.openErrorModal(`Error al crear el horario: ${err.error?.message || err.message}`);
        },
      });
    }
  }

  // Abre un modal de error
  openErrorModal(message: string): void {
    const modalRef = this.modalService.open(ErrorModal);
    modalRef.componentInstance.message = message;
  }

  // Abre un modal de éxito
  openSuccessModal(message: string): void {
    const modalRef = this.modalService.open(ScheduleSuccessModal);
    modalRef.componentInstance.message = message;
  }
}
