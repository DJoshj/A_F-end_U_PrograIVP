import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap'; // Eliminar NgbModule
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../../../core/services/subject-service';
import { ErrorModal } from '../error-modal/error-modal';
import { SubjectSuccessModal } from '../subject-success-modal/subject-success-modal'; // Importar el nuevo modal de éxito para materias

@Component({
  selector: 'app-create-subject-modal',
  standalone: true,
  imports: [CommonModule, FormsModule], // Eliminar NgbModule
  templateUrl: './create-subject-modal.html',
  styleUrl: './create-subject-modal.css',
  providers: [NgbModal, NgbModalConfig],
})
export class CreateSubjectModal implements OnInit {
  subjectCode: string = '';
  subjectName: string = '';
  valueUnits: number | null = null; // Añadir propiedad para unidades valorativas
  selectedCareerId: number | null = null;
  careers: any[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private subjectService: SubjectService,
    private modalService: NgbModal,
    private configM: NgbModalConfig
  ) {
    configM.backdrop = 'static';
    configM.keyboard = false;
  }

  ngOnInit(): void {
    this.loadCareers();
  }

  // Cargar todas las carreras disponibles
  loadCareers(): void {
    this.subjectService.getAllCareers().subscribe({
      next: (data: any) => {
        this.careers = data;
      },
      error: (err: any) => {
        console.error('Error al cargar carreras:', err);
        this.openErrorModal('Error al cargar las carreras.');
      },
    });
  }

  // Guardar la nueva materia
  saveSubject(): void {
    if (!this.subjectCode || !this.subjectName || this.valueUnits === null || !this.selectedCareerId) {
      this.openErrorModal('Por favor, complete todos los campos.');
      return;
    }

    const newSubject = {
      subjectCode: this.subjectCode,
      name: this.subjectName,
      valueUnits: this.valueUnits, // Incluir unidades valorativas
      careerId: this.selectedCareerId,
    };

    this.subjectService.createSubject(newSubject).subscribe({
      next: (response: any) => {
        this.openSuccessModal('Materia agregada exitosamente.');
        this.activeModal.close('success');
        this.subjectService.notifySubjectsChanged(); // Notificar a los suscriptores
      },
      error: (err: any) => {
        console.error('Error al crear materia:', err);
        this.openErrorModal('Error al agregar la materia. Verifique el código o nombre.');
      },
    });
  }

  // Abrir modal de error
  openErrorModal(message: string): void {
    const modalRef = this.modalService.open(ErrorModal);
    modalRef.componentInstance.message = message;
  }

  // Abrir modal de éxito
  openSuccessModal(message: string): void {
    const modalRef = this.modalService.open(SubjectSuccessModal); // Usar el nuevo modal de éxito para materias
    modalRef.componentInstance.message = message;
  }
}
