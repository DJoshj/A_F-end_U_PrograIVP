// schedule-success-modal.ts
// Modal para mostrar un mensaje de éxito después de una operación de horario.
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule-success-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-success-modal.html',
  styleUrl: './schedule-success-modal.css',
})
export class ScheduleSuccessModal {
  @Input() message: string = 'Operación realizada con éxito.';

  constructor(public activeModal: NgbActiveModal) {}

  // Cierra el modal
  close(): void {
    this.activeModal.close('Ok');
  }
}
