import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delete-schedule-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-delete-schedule-modal.html',
  styleUrl: './confirm-delete-schedule-modal.css',
})
export class ConfirmDeleteScheduleModal {
  @Input() message: string = '¿Está seguro de que desea realizar esta acción?';

  constructor(public activeModal: NgbActiveModal) {}

  /**
   * Cierra el modal con un resultado de confirmación.
   */
  confirm(): void {
    this.activeModal.close('confirm');
  }

  /**
   * Cierra el modal con un resultado de cancelación.
   */
  cancel(): void {
    this.activeModal.dismiss('cancel');
  }
}
