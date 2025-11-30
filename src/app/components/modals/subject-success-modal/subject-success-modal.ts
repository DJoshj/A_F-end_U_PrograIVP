import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subject-success-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subject-success-modal.html',
  styleUrl: './subject-success-modal.css',
})
export class SubjectSuccessModal {
  @Input() message!: string;

  constructor(public activeModal: NgbActiveModal) {}
}
