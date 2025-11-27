import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubjectService } from '../../../../core/services/subject-service';
import { SubjectAssignedDTO } from '../../../../core/models/subject.model';
import { TeacherService } from '../../../../core/services/teacher-service';
import { ScheduleService } from '../../../../core/services/schedule-service';
import { ClassroomService } from '../../../../core/services/classroom-service';
import { PeriodService } from '../../../../core/services/period-service';
import { AuthService } from '../../../../core/services/auth-service';
import { MatIconModule } from '@angular/material/icon';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-asignar-subject',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    NgbModule
  ],
  templateUrl: './asignar-subject.html',
  styleUrl: './asignar-subject.css',
})
export class AsignarSubject implements OnInit {
  subjectAssignedId: number | null = null;
  editSubjectForm!: FormGroup;
  erroMSG: string = '';
  teachers: any[] = [];
  schedules: any[] = [];
  availableSchedules: any[] = []; // Para almacenar los horarios disponibles filtrados
  classrooms: any[] = [];
  periods: any[] = [];
  allSubjectAssignments: any[] = []; // Para almacenar todas las asignaciones de materias
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private subjectService: SubjectService,
    private teacherService: TeacherService,
    private scheduleService: ScheduleService,
    private classroomService: ClassroomService,
    private periodService: PeriodService,
    private authService: AuthService
  ) {
    this.editSubjectForm = this.fb.group({
      subjectId: [{ value: '', disabled: true }, Validators.required],
      subjectName: [{ value: '', disabled: true }, Validators.required], 
      teacherId: ['', Validators.required],
      periodId: ['', Validators.required],
      scheduleId: ['', Validators.required],
      classroomId: ['', Validators.required],
      maximumCapacity: ['', [Validators.required, Validators.min(1)]],
      section: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
      return;
    }

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      this.subjectAssignedId = idParam ? +idParam : null;
      if (this.subjectAssignedId) {
        this.loadSubjectAssigned(this.subjectAssignedId);
        this.loadDropdownData();
        this.loadAllSubjectAssignments(); // Cargar todas las asignaciones
      } else {
        this.erroMSG = 'No se proporcionó ID de materia asignada.'; // Mensaje de error si no hay ID
        this.isLoading = false;
      }
    });

    // Suscribirse a los cambios en los campos de periodo y aula para filtrar horarios
    this.editSubjectForm.get('periodId')?.valueChanges.subscribe(() => this.filterSchedules());
    this.editSubjectForm.get('classroomId')?.valueChanges.subscribe(() => this.filterSchedules());
  }

  /**
   * Carga los datos de una materia asignada específica para su edición.
   * @param id El ID de la materia asignada a cargar.
   */
  loadSubjectAssigned(id: number): void {
    this.isLoading = true; // Indicar que se está cargando
    this.subjectService.getSubjectAssignedById(id).subscribe({
      next: (data: any) => {
        // Rellenar el formulario con los datos obtenidos
        console.log(data);
        this.editSubjectForm.patchValue({
          subjectId: data.subjectId,
          subjectName: data.subjectName,
          teacherId: data.teacherId,
          periodId: data.periodId,
          scheduleId: data.scheduleId,
          classroomId: data.classroomId,
          maximumCapacity: data.maximumCapacity,
          section: data.section,
        });
        this.isLoading = false; // Finalizar carga
        this.filterSchedules(); // Filtrar horarios después de cargar los datos iniciales
      },
      error: (err: any) => {
        this.erroMSG = 'Error al cargar la materia asignada: ' + err.message; // Mensaje de error
        console.error('Error al cargar la materia asignada:', err);
        this.isLoading = false; // Finalizar carga
        if (err.status == 401 || err.status === 403) {
          this.authService.logout(); // Cerrar sesión si hay error de autenticación/autorización
        }
      }
    });
  }

  /**
   * Carga los datos para los dropdowns (profesores, horarios, aulas, periodos).
   */
  loadDropdownData(): void {
    this.teacherService.getAllTeachers().subscribe({
      next: (data: any) => this.teachers = data,
      error: (err: any) => console.error('Error al cargar profesores:', err) // Manejo de error
    });

    this.scheduleService.getAllSchedules().subscribe({
      next: (data: any) => {
        this.schedules = data;
        this.filterSchedules(); // Filtrar horarios después de cargarlos
      },
      error: (err: any) => console.error('Error al cargar horarios:', err) // Manejo de error
    });

    this.classroomService.getAllClassrooms().subscribe({
      next: (data: any) => this.classrooms = data,
      error: (err: any) => console.error('Error al cargar aulas:', err) // Manejo de error
    });

    this.periodService.getAllPeriods().subscribe({
      next: (data: any) => this.periods = data,
      error: (err: any) => console.error('Error al cargar periodos:', err) // Manejo de error
    });
  }

  /**
   * Carga todas las asignaciones de materias existentes para realizar validaciones.
   */
  loadAllSubjectAssignments(): void {
    this.subjectService.getAllsubjects().subscribe({
      next: (data: any) => {
        this.allSubjectAssignments = data;
        this.filterSchedules(); // Volver a filtrar horarios después de cargar todas las asignaciones
      },
      error: (err: any) => console.error('Error al cargar todas las asignaciones de materias:', err) // Manejo de error
    });
  }

  /**
   * Filtra los horarios disponibles basándose en el período y aula seleccionados.
   * Un horario no estará disponible si ya está asignado a otra materia
   * en el mismo período y aula (excluyendo la materia que se está editando).
   */
  filterSchedules(): void {
    const currentPeriodId = this.editSubjectForm.get('periodId')?.value;
    const currentClassroomId = this.editSubjectForm.get('classroomId')?.value;
    const currentScheduleId = this.editSubjectForm.get('scheduleId')?.value;

    if (currentPeriodId && currentClassroomId && this.schedules.length > 0 && this.allSubjectAssignments.length > 0) {
      this.availableSchedules = this.schedules.filter(schedule => {
        // Verificar si el horario está ocupado por otra asignación (excluyendo la actual)
        const isOccupied = this.allSubjectAssignments.some(assignment =>
          assignment.subjectAssignedId !== this.subjectAssignedId && // Excluir la materia actual
          assignment.classroomId === currentClassroomId &&
          assignment.scheduleId === schedule.scheduleId &&
          assignment.periodId === currentPeriodId
        );
        return !isOccupied;
      });

      // Si el horario actualmente seleccionado ya no está disponible, deseleccionarlo
      if (currentScheduleId && !this.availableSchedules.some(s => s.scheduleId === currentScheduleId)) {
        this.editSubjectForm.get('scheduleId')?.setValue(null);
      }
    } else {
      // Si no hay periodo o aula seleccionada, o si no hay datos cargados, mostrar todos los horarios
      this.availableSchedules = [...this.schedules];
    }
  }

  /**
   * Maneja el envío del formulario para actualizar la materia asignada.
   */
  onSubmit(): void {
    this.erroMSG = ''; // Limpiar mensajes de error previos
    if (this.editSubjectForm.valid && this.subjectAssignedId) {
      const formValues = this.editSubjectForm.getRawValue(); // Usar getRawValue para incluir campos deshabilitados

      // Validar conflicto de horario en el frontend
      const classroomScheduleConflict = this.allSubjectAssignments.some(assignment =>
        assignment.subjectAssignedId !== this.subjectAssignedId && // Excluir la materia actual
        assignment.classroomId === formValues.classroomId &&
        assignment.scheduleId === formValues.scheduleId &&
        assignment.periodId === formValues.periodId
      );

      if (classroomScheduleConflict) {
        this.erroMSG = 'El horario seleccionado ya está ocupado para esta aula en este período.';
        return;
      }

      // Validar conflicto de docente en el frontend
      const teacherConflict = this.allSubjectAssignments.some(assignment =>
        assignment.subjectAssignedId !== this.subjectAssignedId && // Excluir la materia actual
        assignment.teacherId === formValues.teacherId &&
        assignment.scheduleId === formValues.scheduleId &&
        assignment.periodId === formValues.periodId
      );

      if (teacherConflict) {
        this.erroMSG = 'El docente seleccionado ya está asignado a otra materia en este horario y período.';
        return;
      }

      const updatedSubject: SubjectAssignedDTO = {
        subjectId: formValues.subjectId, // Ahora se incluye el subjectId deshabilitado
        teacherId: formValues.teacherId,
        periodId: formValues.periodId,
        scheduleId: formValues.scheduleId,
        classroomId: formValues.classroomId,
        maximumCapacity: formValues.maximumCapacity,
        section: formValues.section,
      };

      this.subjectService.updateSubjectAssigned(this.subjectAssignedId, updatedSubject).subscribe({
        next: () => {
          this.router.navigate(['/home/administracion/assigned-subjects']); // Navegar de vuelta a la lista de materias
        },
        error: (err: any) => {
          this.erroMSG = 'Error al actualizar la materia asignada: ' + err.message; // Mensaje de error
          console.error('Error al actualizar la materia asignada:', err);
          if (err.status == 401 || err.status === 403) {
            this.authService.logout(); // Cerrar sesión si hay error de autenticación/autorización
          }
        }
      });
    } else {
      this.erroMSG = 'Por favor, complete todos los campos requeridos.'; // Mensaje de error si el formulario no es válido
    }
  }

  /**
   * Navega de vuelta a la página de administración de materias.
   */
  goBack(): void {
    this.router.navigate(['/home/administracion/assigned-subjects']);
  }


}
