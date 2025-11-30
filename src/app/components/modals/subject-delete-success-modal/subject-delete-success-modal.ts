import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subject-delete-success-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subject-delete-success-modal.html',
  styleUrl: './subject-delete-success-modal.css',
})
export class SubjectDeleteSuccessModal {
  @Input() message!: string;

  constructor(public activeModal: NgbActiveModal) {}
}
