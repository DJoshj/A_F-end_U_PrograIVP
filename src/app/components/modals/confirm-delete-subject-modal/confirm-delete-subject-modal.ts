import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delete-subject-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-delete-subject-modal.html',
  styleUrl: './confirm-delete-subject-modal.css',
})
export class ConfirmDeleteSubjectModal {
  @Input() message!: string;

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
