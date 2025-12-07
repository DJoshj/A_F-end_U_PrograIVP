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
  @Input() scheduleId: number | null = null;
  
  dayInput: string = '';
  startHourInput: string = '00';
  startMinuteInput: string = '00';
  endHourInput: string = '00';
  endMinuteInput: string = '00';

  title: string = 'Crear Nuevo Horario';
  isEditMode: boolean = false;

  hours: string[] = [];
  minutes: string[] = ['00','10', '15','30', '45'];

  constructor(
    public activeModal: NgbActiveModal,
    private scheduleService: ScheduleService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.generateHours();
    if (this.scheduleId) {
      this.isEditMode = true;
      this.title = 'Editar Horario';
      this.loadScheduleForEdit(this.scheduleId);
    }
  }

  /**
   * Carga los datos del horario para edición.
   * @param id El ID del horario a cargar.
   */
  loadScheduleForEdit(id: number): void {
    this.scheduleService.getScheduleById(id).subscribe({
      next: (data: Schedule) => {
        this.dayInput = data.days;
        const [startTime, endTime] = data.schedule.split('-');
        this.startHourInput = startTime.split(':')[0];
        this.startMinuteInput = startTime.split(':')[1];
        this.endHourInput = endTime.split(':')[0];
        this.endMinuteInput = endTime.split(':')[1];
      },
      error: (err: any) => {
        console.error('Error al cargar horario para edición:', err);
        this.openErrorModal('Error al cargar los datos del horario.');
        this.activeModal.dismiss('error');
      },
    });
  }

  /**
   * Guarda el horario (crea o actualiza) enviando los datos al servicio.
   * Incluye validaciones de hora, minutos y duración mínima.
   */
  saveSchedule(): void {
    const startTime = `${this.startHourInput}:${this.startMinuteInput}`;
    const endTime = `${this.endHourInput}:${this.endMinuteInput}`;

    if (!this.startHourInput || !this.startMinuteInput || !this.endHourInput || !this.endMinuteInput) {
      this.openErrorModal('Por favor, seleccione la hora y los minutos de inicio y fin.');
      return;
    }

    const startDateTime = new Date(`2000/01/01 ${startTime}`);
    const endDateTime = new Date(`2000/01/01 ${endTime}`);

    if (startDateTime >= endDateTime) {
      this.openErrorModal('La hora de inicio no puede ser mayor o igual que la hora de fin.');
      return;
    }

    const diffMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
    if (diffMinutes < 90) {
      this.openErrorModal('Debe haber al menos 1.5 horas (90 minutos) entre la hora de inicio y la hora de fin.');
      return;
    }

    const dayPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,_]+$/;
    if (!this.dayInput || !dayPattern.test(this.dayInput)) {
      this.openErrorModal('Por favor, ingrese los días en un formato válido (ej. "lun_mar", "miercoles").');
      return;
    }

    const scheduleDTO: ScheduleDTO = {
      days: this.dayInput,
      schedule: `${startTime}-${endTime}`,
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

  /**
   * Abre un modal de error con un mensaje específico.
   * @param message El mensaje de error a mostrar.
   */
  openErrorModal(message: string): void {
    const modalRef = this.modalService.open(ErrorModal);
    modalRef.componentInstance.errorMessage = message;
  }

  /**
   * Abre un modal de éxito.
   * @param message El mensaje de éxito a mostrar.
   */
  openSuccessModal(message: string): void {
    const modalRef = this.modalService.open(ScheduleSuccessModal);
    modalRef.componentInstance.message = message;
  }

  /**
   * Genera la lista de horas (00-23) para el dropdown.
   */
  private generateHours(): void {
    for (let i = 0; i < 24; i++) {
      this.hours.push(i.toString().padStart(2, '0'));
    }
  }
}
