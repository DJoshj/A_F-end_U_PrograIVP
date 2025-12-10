import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssigenedSubjectService } from '../../../../core/services/Assignedsubject-service';
import { SubjectAssignedDTO, SubjectModel } from '../../../../core/models/subject.model';
import { TeacherService } from '../../../../core/services/teacher-service';
import { ScheduleService } from '../../../../core/services/schedule-service';
import { ClassroomService } from '../../../../core/services/classroom-service';
import { PeriodService } from '../../../../core/services/period-service';
import { AuthService } from '../../../../core/services/auth-service';
import { MatIconModule } from '@angular/material/icon';
import { NgbModule, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { SubjectService } from '../../../../core/services/subject-service';
import { ErrorModal } from '@app/components/modals/error-modal/error-modal';
import { SuccessModal } from '@app/components/modals/success-modal/success-modal';

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
  isEditMode: boolean = false;
  asignarSubjectForm!: FormGroup;
  erroMSG: string = '';
  teachers: any[] = [];
  availableTeachers: any[] = []; // Docentes disponibles según el horario y período
  schedules: any[] = [];
  availableSchedules: any[] = [];
  classrooms: any[] = [];
  availableClassrooms: any[] = []; // Aulas disponibles según el horario y período
  periods: any[] = [];
  subjects: SubjectModel[] = []; // Para la selección de materias en modo creación
  unassignedSubjects: SubjectModel[] = []; // Materias que aún no han sido asignadas
  allSubjectAssignments: any[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private assigenedSubjectService: AssigenedSubjectService,
    private teacherService: TeacherService,
    private scheduleService: ScheduleService,
    private classroomService: ClassroomService,
    private periodService: PeriodService,
    private authService: AuthService,
    private subjectService: SubjectService, // Inject SubjectService
    private modalService: NgbModal,
    private configM: NgbModalConfig
  ) {
    configM.backdrop = 'static';
    configM.keyboard = false;

    this.asignarSubjectForm = this.fb.group({
      subjectId: ['', Validators.required], // Habilitado para creación
      subjectName: [{ value: '', disabled: true }], // Solo para visualización en modo edición o después de seleccionar
      teacherId: [{ value: '', disabled: true }, Validators.required], // Deshabilitado inicialmente
      periodId: ['', Validators.required],
      scheduleId: [{ value: '', disabled: true }, Validators.required], // Deshabilitado inicialmente
      classroomId: [{ value: '', disabled: true }, Validators.required], // Deshabilitado inicialmente
      maximumCapacity: ['', [Validators.required, Validators.min(1), this.maximumCapacityValidator.bind(this)]],
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
      this.isEditMode = !!this.subjectAssignedId;

      this.loadDropdownData();
      this.loadAllSubjectAssignments();

      if (this.isEditMode) {
        this.asignarSubjectForm.get('subjectId')?.disable(); // Deshabilitar selección de materia en modo edición
        this.loadSubjectAssigned(this.subjectAssignedId!);
      } else {
        this.asignarSubjectForm.get('subjectName')?.disable(); // Asegurar que subjectName esté deshabilitado en modo creación
        this.loadSubjects(); // Cargar materias para selección en modo creación
        this.isLoading = false;
      }
    });

    // Suscripciones para la lógica de filtrado y habilitación/deshabilitación
    this.asignarSubjectForm.get('periodId')?.valueChanges.subscribe(periodId => {
      this.asignarSubjectForm.get('scheduleId')?.setValue(null); // Limpiar horario al cambiar periodo
      this.asignarSubjectForm.get('classroomId')?.setValue(null); // Limpiar aula al cambiar periodo
      this.asignarSubjectForm.get('teacherId')?.setValue(null); // Limpiar docente al cambiar periodo

      if (periodId) {
        this.asignarSubjectForm.get('scheduleId')?.enable();
        this.filterSchedules();
      } else {
        this.asignarSubjectForm.get('scheduleId')?.disable();
        this.asignarSubjectForm.get('classroomId')?.disable();
        this.asignarSubjectForm.get('teacherId')?.disable();
        this.availableSchedules = [];
        this.availableClassrooms = [];
        this.availableTeachers = [];
      }
    });

    this.asignarSubjectForm.get('scheduleId')?.valueChanges.subscribe(scheduleId => {
      this.asignarSubjectForm.get('classroomId')?.setValue(null); // Limpiar aula al cambiar horario
      this.asignarSubjectForm.get('teacherId')?.setValue(null); // Limpiar docente al cambiar horario

      if (scheduleId) {
        this.asignarSubjectForm.get('classroomId')?.enable();
        this.asignarSubjectForm.get('teacherId')?.enable();
        this.filterClassrooms();
        this.filterTeachers();
      } else {
        this.asignarSubjectForm.get('classroomId')?.disable();
        this.asignarSubjectForm.get('teacherId')?.disable();
        this.availableClassrooms = [];
        this.availableTeachers = [];
      }
    });

    this.asignarSubjectForm.get('classroomId')?.valueChanges.subscribe(() => {
      this.asignarSubjectForm.get('maximumCapacity')?.updateValueAndValidity();
    });

    this.asignarSubjectForm.get('subjectId')?.valueChanges.subscribe(subjectId => {
      if (!this.isEditMode && subjectId) {
        const selectedSubject = this.subjects.find(s => s.subjectId === subjectId);
        if (selectedSubject) {
          this.asignarSubjectForm.get('subjectName')?.setValue(selectedSubject.subjectName);
        }
      }
    });
  }

  /**
   * Validador personalizado para la capacidad máxima para asegurar que no exceda la capacidad del aula.
   */
  maximumCapacityValidator(control: { value: number }): { [key: string]: any } | null {
    const capacity = control.value;
    const classroomId = this.asignarSubjectForm?.get('classroomId')?.value;

    if (!capacity || !classroomId || !this.classrooms.length) {
      return null;
    }

    const selectedClassroom = this.classrooms.find(c => c.classroomId === classroomId);

    if (selectedClassroom && capacity > selectedClassroom.ability) {
      return { 'capacityExceedsAbility': { max: selectedClassroom.ability, actual: capacity } };
    }
    return null;
  }

  /**
   * Carga los datos de una materia asignada específica para su edición.
   * @param id El ID de la materia asignada a cargar.
   */
  loadSubjectAssigned(id: number): void {
    this.isLoading = true;
    this.assigenedSubjectService.getSubjectAssignedById(id).subscribe({
      next: (data: any) => {
        this.asignarSubjectForm.patchValue({
          subjectId: data.subjectId,
          subjectName: data.subjectName,
          teacherId: data.teacherId,
          periodId: data.periodId,
          scheduleId: data.scheduleId,
          classroomId: data.classroomId,
          maximumCapacity: data.maximumCapacity,
          section: data.section,
        });
        // En modo edición, habilitar los campos relevantes después de cargar los datos
        this.asignarSubjectForm.get('scheduleId')?.enable();
        this.asignarSubjectForm.get('classroomId')?.enable();
        this.asignarSubjectForm.get('teacherId')?.enable();

        this.isLoading = false;
        // Volver a filtrar para asegurar que los dropdowns muestren las opciones correctas
        this.filterSchedules();
        this.filterClassrooms();
        this.filterTeachers();
      },
      error: (err: any) => {
        this.erroMSG = 'Error al cargar la materia asignada: ' + err.message;
        console.error('Error al cargar la materia asignada:', err);
        this.isLoading = false;
        if (err.status == 401 || err.status === 403) {
          this.authService.logout();
        }
        this.openErrorModal(this.erroMSG);
      }
    });
  }

  /**
   * Carga todas las materias disponibles para la selección en modo creación.
   */
  /**
   * Carga todas las materias disponibles para la selección en modo creación y las filtra.
   */
  loadSubjects(): void {
    this.subjectService.getAllSubject().subscribe({
      next: (data: SubjectModel[]) => {
        this.subjects = data;
        this.filterUnassignedSubjects(); // Filtrar materias no asignadas después de cargar
      },
      error: (err: any) => {
        console.error('Error al cargar materias:', err);
        this.openErrorModal('Error al cargar las materias disponibles.');
      }
    });
  }

  /**
   * Filtra las materias para mostrar solo aquellas que no han sido asignadas.
   */
  filterUnassignedSubjects(): void {
    if (this.subjects.length > 0 && this.allSubjectAssignments.length > 0) {
      const assignedSubjectIds = new Set(this.allSubjectAssignments.map(assignment => assignment.subjectId));
      this.unassignedSubjects = this.subjects.filter(subject => !assignedSubjectIds.has(subject.subjectId));
    } else {
      this.unassignedSubjects = [...this.subjects]; // Si no hay asignaciones, todas están disponibles
    }
  }

  /**
   * Carga los datos para los dropdowns (profesores, horarios, aulas, periodos).
   */
  loadDropdownData(): void {
    this.teacherService.getAllTeachers().subscribe({
      next: (data: any) => this.teachers = data,
      error: (err: any) => {
        console.error('Error al cargar profesores:', err);
        this.openErrorModal('Error al cargar los profesores.');
      }
    });

    this.scheduleService.getAllSchedules().subscribe({
      next: (data: any) => {
        this.schedules = data;
        this.filterSchedules();
      },
      error: (err: any) => {
        console.error('Error al cargar horarios:', err);
        this.openErrorModal('Error al cargar los horarios.');
      }
    });

    this.classroomService.getAllClassrooms().subscribe({
      next: (data: any) => this.classrooms = data,
      error: (err: any) => {
        console.error('Error al cargar aulas:', err);
        this.openErrorModal('Error al cargar las aulas.');
      }
    });

    this.periodService.getAllPeriods().subscribe({
      next: (data: any) => this.periods = data,
      error: (err: any) => {
        console.error('Error al cargar periodos:', err);
        this.openErrorModal('Error al cargar los periodos.');
      }
    });
  }

  /**
   * Carga todas las asignaciones de materias existentes para realizar validaciones.
   */
  loadAllSubjectAssignments(): void {
    this.assigenedSubjectService.getAllsubjects().subscribe({
      next: (data: any) => {
        this.allSubjectAssignments = data;
        this.filterSchedules();
        this.filterUnassignedSubjects(); // También filtrar materias no asignadas aquí
        this.filterClassrooms(); // Filtrar aulas al cargar todas las asignaciones
        this.filterTeachers(); // Filtrar docentes al cargar todas las asignaciones
      },
      error: (err: any) => {
        console.error('Error al cargar todas las asignaciones de materias:', err);
        this.openErrorModal('Error al cargar todas las asignaciones de materias para validación.');
      }
    });
  }

  /**
   * Filtra los horarios disponibles basándose en el período y aula seleccionados.
   * Un horario no estará disponible si ya está asignado a otra materia
   * en el mismo período y aula (excluyendo la materia que se está editando).
   */
  filterSchedules(): void {
    const currentPeriodId = this.asignarSubjectForm.get('periodId')?.value;
    const currentScheduleId = this.asignarSubjectForm.get('scheduleId')?.value; // Solo necesitamos el scheduleId para filtrar horarios

    if (currentPeriodId && this.schedules.length > 0 && this.allSubjectAssignments.length > 0) {
      this.availableSchedules = this.schedules.filter(schedule => {
        // Un horario está disponible si no hay ninguna asignación existente
        // con el mismo periodo y horario, independientemente del aula o docente.
        // Esto es para asegurar que el horario en sí no esté "reservado" de alguna manera.
        // Sin embargo, el requisito es que el horario se seleccione primero,
        // y luego se filtren aulas y docentes.
        // Por lo tanto, aquí solo filtramos por periodo si es necesario,
        // pero la lógica principal de disponibilidad de horario se manejará
        // al filtrar aulas y docentes.
        // Por ahora, simplemente filtramos por periodo si hay alguna lógica de negocio que lo requiera.
        // Si no, todos los horarios son "disponibles" para ser seleccionados inicialmente con un periodo.
        return true; // Todos los horarios son potencialmente disponibles para un periodo
      });

      // Si el horario actualmente seleccionado ya no es válido para el periodo, limpiarlo
      if (currentScheduleId && !this.availableSchedules.some(s => s.scheduleId === currentScheduleId)) {
        this.asignarSubjectForm.get('scheduleId')?.setValue(null);
      }
    } else {
      this.availableSchedules = [...this.schedules]; // Mostrar todos los horarios si no hay periodo seleccionado
    }
  }

  /**
   * Filtra las aulas disponibles basándose en el período y horario seleccionados.
   * Un aula no estará disponible si ya está asignada a otra materia
   * en el mismo período y horario (excluyendo la materia que se está editando).
   */
  filterClassrooms(): void {
    const currentPeriodId = this.asignarSubjectForm.get('periodId')?.value;
    const currentScheduleId = this.asignarSubjectForm.get('scheduleId')?.value;
    const currentClassroomId = this.asignarSubjectForm.get('classroomId')?.value;

    if (currentPeriodId && currentScheduleId && this.classrooms.length > 0 && this.allSubjectAssignments.length > 0) {
      this.availableClassrooms = this.classrooms.filter(classroom => {
        const isOccupied = this.allSubjectAssignments.some(assignment =>
          assignment.subjectAssignedId !== this.subjectAssignedId && // Excluir la materia actual en modo edición
          assignment.classroomId === classroom.classroomId &&
          assignment.scheduleId === currentScheduleId &&
          assignment.periodId === currentPeriodId
        );
        return !isOccupied;
      });

      // Si el aula actualmente seleccionada ya no está disponible, limpiarla
      if (currentClassroomId && !this.availableClassrooms.some(c => c.classroomId === currentClassroomId)) {
        this.asignarSubjectForm.get('classroomId')?.setValue(null);
      }
    } else {
      this.availableClassrooms = [...this.classrooms]; // Mostrar todas las aulas si no hay periodo/horario seleccionado
    }
  }

  /**
   * Filtra los docentes disponibles basándose en el período y horario seleccionados.
   * Un docente no estará disponible si ya está asignado a otra materia
   * en el mismo período y horario (excluyendo la materia que se está editando).
   */
  filterTeachers(): void {
    const currentPeriodId = this.asignarSubjectForm.get('periodId')?.value;
    const currentScheduleId = this.asignarSubjectForm.get('scheduleId')?.value;
    const currentTeacherId = this.asignarSubjectForm.get('teacherId')?.value;

    if (currentPeriodId && currentScheduleId && this.teachers.length > 0 && this.allSubjectAssignments.length > 0) {
      this.availableTeachers = this.teachers.filter(teacher => {
        const isOccupied = this.allSubjectAssignments.some(assignment =>
          assignment.subjectAssignedId !== this.subjectAssignedId && // Excluir la materia actual en modo edición
          assignment.teacherId === teacher.teacherId &&
          assignment.scheduleId === currentScheduleId &&
          assignment.periodId === currentPeriodId
        );
        return !isOccupied;
      });

      // Si el docente actualmente seleccionado ya no está disponible, limpiarlo
      if (currentTeacherId && !this.availableTeachers.some(t => t.teacherId === currentTeacherId)) {
        this.asignarSubjectForm.get('teacherId')?.setValue(null);
      }
    } else {
      this.availableTeachers = [...this.teachers]; // Mostrar todos los docentes si no hay periodo/horario seleccionado
    }
  }

  /**
   * Maneja el envío del formulario para crear o actualizar la materia asignada.
   */
  onSubmit(): void {
    this.erroMSG = '';
    if (this.asignarSubjectForm.valid) {
      const formValues = this.asignarSubjectForm.getRawValue();

      // Validaciones comunes para creación y actualización
      // Las validaciones de conflicto de aula y docente ya están implícitas en los filtros de los dropdowns.
      // Sin embargo, se mantienen aquí como una capa de seguridad adicional en el backend.
      // Si el usuario logra seleccionar un aula o docente no disponible (por manipulación del DOM, por ejemplo),
      // estas validaciones lo atraparán.

      const classroomScheduleConflict = this.allSubjectAssignments.some(assignment =>
        (this.isEditMode ? assignment.subjectAssignedId !== this.subjectAssignedId : true) && // Excluir la materia actual en modo edición
        assignment.classroomId === formValues.classroomId &&
        assignment.scheduleId === formValues.scheduleId &&
        assignment.periodId === formValues.periodId
      );

      if (classroomScheduleConflict) {
        this.erroMSG = 'El aula seleccionada ya está ocupada para este horario en este período.';
        this.openErrorModal(this.erroMSG);
        return;
      }

      const teacherConflict = this.allSubjectAssignments.some(assignment =>
        (this.isEditMode ? assignment.subjectAssignedId !== this.subjectAssignedId : true) && // Excluir la materia actual en modo edición
        assignment.teacherId === formValues.teacherId &&
        assignment.scheduleId === formValues.scheduleId &&
        assignment.periodId === formValues.periodId
      );

      if (teacherConflict) {
        this.erroMSG = 'El docente seleccionado ya está asignado a otra materia en este horario y período.';
        this.openErrorModal(this.erroMSG);
        return;
      }

      const subjectAssignedDTO: SubjectAssignedDTO = {
        subjectId: formValues.subjectId,
        teacherId: formValues.teacherId,
        periodId: formValues.periodId,
        scheduleId: formValues.scheduleId,
        classroomId: formValues.classroomId,
        maximumCapacity: formValues.maximumCapacity,
        section: formValues.section,
      };

      console.log('Payload sent to backend:', subjectAssignedDTO);

      if (this.isEditMode && this.subjectAssignedId) {
        this.assigenedSubjectService.updateSubjectAssigned(this.subjectAssignedId, subjectAssignedDTO).subscribe({
          next: () => {
            this.openSuccessModal('Materia asignada actualizada exitosamente.');
            this.router.navigate(['/home/administracion/assigned-subjects']);
          },
          error: (err: any) => {
            if (err.error && typeof err.error === 'string') {
              this.erroMSG = err.error;
            } else {
              this.erroMSG = 'Error al actualizar la materia asignada. Por favor, intente de nuevo.';
            }
            console.error('Error al actualizar la materia asignada:', err);
            if (err.status == 401 || err.status === 403) {
              this.authService.logout();
            }
            this.openErrorModal(this.erroMSG);
          }
        });
      } else {
        // Create mode
        this.assigenedSubjectService.createSubjectAssigned(subjectAssignedDTO).subscribe({
          next: () => {
            this.openSuccessModal('Materia asignada exitosamente.');
            this.router.navigate(['/home/administracion/assigned-subjects']);
          },
          error: (err: any) => {
            if (err.error && typeof err.error === 'string') {
              this.erroMSG = err.error;
            } else {
              this.erroMSG = 'Error al crear la materia asignada. Por favor, intente de nuevo.';
            }
            console.error('Error al crear la materia asignada:', err);
            if (err.status == 401 || err.status === 403) {
              this.authService.logout();
            }
            this.openErrorModal(this.erroMSG);
          }
        });
      }
    } else {
      this.erroMSG = 'Por favor, complete todos los campos requeridos y corrija los errores.';
      this.openErrorModal(this.erroMSG);
    }
  }

  /**
   * Abre un modal de error.
   * @param message El mensaje de error a mostrar.
   */
  openErrorModal(message: string): void {
    const modalRef = this.modalService.open(ErrorModal);
    modalRef.componentInstance.message = message;
  }

  /**
   * Abre un modal de éxito.
   * @param message El mensaje de éxito a mostrar.
   */
  openSuccessModal(message: string): void {
    const modalRef = this.modalService.open(SuccessModal);
    modalRef.componentInstance.message = message;
  }

  /**
   * Navega de vuelta a la página de administración de materias.
   */
  goBack(): void {
    this.router.navigate(['/home/administracion/assigned-subjects']);
  }


}
