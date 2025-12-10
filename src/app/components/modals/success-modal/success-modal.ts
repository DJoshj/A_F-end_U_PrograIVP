import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-success-modal',
  imports: [CommonModule], // Add CommonModule to imports
  templateUrl: './success-modal.html',
  styles: ``,
  standalone: true // Mark as standalone
})
export class SuccessModal {
  @Input() message: string = '';

  constructor(public activeModal: NgbActiveModal) {}
}
