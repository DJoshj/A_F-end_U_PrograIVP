import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-error-modal',
  imports: [CommonModule], // Add CommonModule to imports
  templateUrl: './error-modal.html',
  styles: ``,
  standalone: true // Mark as standalone
})
export class ErrorModal {
  @Input() errorMessage!: string;

  constructor(public activeModal: NgbActiveModal) {}
}
