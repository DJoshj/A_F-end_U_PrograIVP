import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssigenedSubjectService } from '../../../../core/services/Assignedsubject-service';
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
  availableSchedules: any[] = [];
  classrooms: any[] = [];
  periods: any[] = [];
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
    private authService: AuthService
  ) {
    this.editSubjectForm = this.fb.group({
      subjectId: [{ value: '', disabled: true }, Validators.required],
      subjectName: [{ value: '', disabled: true }, Validators.required], 
      teacherId: ['', Validators.required],
      periodId: ['', Validators.required],
      scheduleId: ['', Validators.required],
      classroomId: ['', Validators.required],
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
      if (this.subjectAssignedId) {
        this.loadSubjectAssigned(this.subjectAssignedId);
        this.loadDropdownData();
        this.loadAllSubjectAssignments();
      } else {
        this.erroMSG = 'No se proporcionó ID de materia asignada.';
        this.isLoading = false;
      }
    });

    this.editSubjectForm.get('periodId')?.valueChanges.subscribe(() => this.filterSchedules());
    this.editSubjectForm.get('classroomId')?.valueChanges.subscribe(() => {
      this.filterSchedules();
      this.editSubjectForm.get('maximumCapacity')?.updateValueAndValidity();
    });
  }

  /**
   * Validador personalizado para la capacidad máxima para asegurar que no exceda la capacidad del aula.
   */
  maximumCapacityValidator(control: { value: number }): { [key: string]: any } | null {
    const capacity = control.value;
    const classroomId = this.editSubjectForm?.get('classroomId')?.value;

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
        this.isLoading = false;
        this.filterSchedules();
      },
      error: (err: any) => {
        this.erroMSG = 'Error al cargar la materia asignada: ' + err.message;
        console.error('Error al cargar la materia asignada:', err);
        this.isLoading = false;
        if (err.status == 401 || err.status === 403) {
          this.authService.logout();
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
      error: (err: any) => console.error('Error al cargar profesores:', err)
    });

    this.scheduleService.getAllSchedules().subscribe({
      next: (data: any) => {
        this.schedules = data;
        this.filterSchedules();
      },
      error: (err: any) => console.error('Error al cargar horarios:', err)
    });

    this.classroomService.getAllClassrooms().subscribe({
      next: (data: any) => this.classrooms = data,
      error: (err: any) => console.error('Error al cargar aulas:', err)
    });

    this.periodService.getAllPeriods().subscribe({
      next: (data: any) => this.periods = data,
      error: (err: any) => console.error('Error al cargar periodos:', err)
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
      },
      error: (err: any) => console.error('Error al cargar todas las asignaciones de materias:', err)
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
        const isOccupied = this.allSubjectAssignments.some(assignment =>
          assignment.subjectAssignedId !== this.subjectAssignedId &&
          assignment.classroomId === currentClassroomId &&
          assignment.scheduleId === schedule.scheduleId &&
          assignment.periodId === currentPeriodId
        );
        return !isOccupied;
      });

      if (currentScheduleId && !this.availableSchedules.some(s => s.scheduleId === currentScheduleId)) {
        this.editSubjectForm.get('scheduleId')?.setValue(null);
      }
    } else {
      this.availableSchedules = [...this.schedules];
    }
  }

  /**
   * Maneja el envío del formulario para actualizar la materia asignada.
   */
  onSubmit(): void {
    this.erroMSG = '';
    if (this.editSubjectForm.valid && this.subjectAssignedId) {
      const formValues = this.editSubjectForm.getRawValue();

      const classroomScheduleConflict = this.allSubjectAssignments.some(assignment =>
        assignment.subjectAssignedId !== this.subjectAssignedId &&
        assignment.classroomId === formValues.classroomId &&
        assignment.scheduleId === formValues.scheduleId &&
        assignment.periodId === formValues.periodId
      );

      if (classroomScheduleConflict) {
        this.erroMSG = 'El horario seleccionado ya está ocupado para esta aula en este período.';
        return;
      }

      const teacherConflict = this.allSubjectAssignments.some(assignment =>
        assignment.subjectAssignedId !== this.subjectAssignedId &&
        assignment.teacherId === formValues.teacherId &&
        assignment.scheduleId === formValues.scheduleId &&
        assignment.periodId === formValues.periodId
      );

      if (teacherConflict) {
        this.erroMSG = 'El docente seleccionado ya está asignado a otra materia en este horario y período.';
        return;
      }

      const updatedSubject: SubjectAssignedDTO = {
        subjectId: formValues.subjectId,
        teacherId: formValues.teacherId,
        periodId: formValues.periodId,
        scheduleId: formValues.scheduleId,
        classroomId: formValues.classroomId,
        maximumCapacity: formValues.maximumCapacity,
        section: formValues.section,
      };

      console.log('Payload sent to backend:', updatedSubject);

      this.assigenedSubjectService.updateSubjectAssigned(this.subjectAssignedId, updatedSubject).subscribe({
        next: () => {
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
        }
      });
    } else {
      this.erroMSG = 'Por favor, complete todos los campos requeridos.';
    }
  }

  /**
   * Navega de vuelta a la página de administración de materias.
   */
  goBack(): void {
    this.router.navigate(['/home/administracion/assigned-subjects']);
  }


}
