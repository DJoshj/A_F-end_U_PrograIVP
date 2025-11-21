# Explicación del Flujo de Edición de Materias Asignadas

Este documento detalla los cambios realizados en el frontend (Angular) para mejorar la validación y la experiencia de usuario al editar materias asignadas, así como la corrección de un problema de visualización del nombre de la materia.

## 1. Problemas Iniciales y Requerimientos

Originalmente, el componente `editar-subject` permitía modificar los detalles de una materia asignada. Sin embargo, existían los siguientes problemas y requerimientos:

*   **Validación de conflictos de aula/horario:** Era necesario asegurar que al cambiar el aula o el horario de una materia, la nueva combinación no estuviera ya ocupada por otra materia en el mismo período. Se sugirió que la selección del horario debería depender del aula y el período elegidos.
*   **Validación de conflictos de docente:** Se requería una validación adicional para asegurar que un docente no fuera asignado a dos materias que tuvieran el mismo horario y período.
*   **Error al actualizar `subjectId`:** Se presentaba un error `400 Bad Request` al intentar actualizar una materia, indicando un problema con el `subjectId`. Esto se debía a que el campo `subjectId` estaba deshabilitado en el formulario y su valor no se enviaba correctamente.
*   **Visualización del nombre de la materia:** El nombre de la materia no se mostraba correctamente en el formulario de edición, lo que generaba un error `TS2339`.
*   **Página de carga:** Se solicitó aplicar la misma lógica de página de carga utilizada en `editar-subject` al componente `editar-usuario`.
*   **Comentarios en español:** Todos los comentarios del código debían estar en español.

## 2. Soluciones Implementadas

Se realizaron las siguientes modificaciones para abordar los problemas y requerimientos:

### 2.1. Filtrado Dinámico de Horarios y Reordenamiento de Campos

Para que el horario cambie según el aula y el período, se ajustó la lógica en `editar-subject.ts` y la estructura en `editar-subject.html`.

**Cambios en `src/app/components/administracion/sub-componets/editar-subject/editar-subject.ts`:**

1.  **Nueva propiedad `availableSchedules`:** Se añadió una nueva propiedad `availableSchedules` para almacenar los horarios que están realmente disponibles después de aplicar los filtros.
    ```typescript
    export class EditarSubject implements OnInit {
      // ... otras propiedades
      schedules: any[] = [];
      availableSchedules: any[] = []; // Para almacenar los horarios disponibles filtrados
      classrooms: any[] = [];
      periods: any[] = [];
      // ...
    }
    ```
2.  **Suscripción a cambios en `periodId` y `classroomId`:** En `ngOnInit`, se añadieron suscripciones a los cambios de valor de `periodId` y `classroomId` para que el método `filterSchedules()` se ejecute cada vez que uno de estos campos cambie.
    ```typescript
    ngOnInit(): void {
      // ...
      // Suscribirse a los cambios en los campos de periodo y aula para filtrar horarios
      this.editSubjectForm.get('periodId')?.valueChanges.subscribe(() => this.filterSchedules());
      this.editSubjectForm.get('classroomId')?.valueChanges.subscribe(() => this.filterSchedules());
    }
    ```
3.  **Método `filterSchedules()`:** Este método se encarga de filtrar la lista completa de horarios (`this.schedules`) basándose en el `periodId` y `classroomId` seleccionados. Un horario se considera no disponible si ya está ocupado por otra asignación de materia (excluyendo la materia que se está editando actualmente). Si el horario previamente seleccionado ya no está disponible, se deselecciona.
    ```typescript
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
    ```
4.  **Llamadas a `filterSchedules()`:** Se asegura que `filterSchedules()` se llame después de cargar los datos iniciales de la materia y después de cargar todos los horarios y asignaciones de materias.
    ```typescript
    loadSubjectAssigned(id: number): void {
      // ...
      next: (data: any) => {
        // ...
        this.filterSchedules(); // Filtrar horarios después de cargar los datos iniciales
      },
      // ...
    }

    loadDropdownData(): void {
      // ...
      this.scheduleService.getAllSchedules().subscribe({
        next: (data: any) => {
          this.schedules = data;
          this.filterSchedules(); // Filtrar horarios después de cargarlos
        },
        // ...
      });
      // ...
    }

    loadAllSubjectAssignments(): void {
      // ...
      next: (data: any) => {
        this.allSubjectAssignments = data;
        this.filterSchedules(); // Volver a filtrar horarios después de cargar todas las asignaciones
      },
      // ...
    }
    ```

**Cambios en `src/app/components/administracion/sub-componets/editar-subject/editar-subject.html`:**

1.  **Reordenamiento de campos:** Los campos de "Aula" y "Horario" se reordenaron para que "Aula" aparezca antes que "Horario".
2.  **Uso de `availableSchedules`:** El `select` del campo "Horario" ahora itera sobre `availableSchedules` en lugar de `schedules`.
    ```html
    <!-- Campo de Aula (ahora antes de Horario) -->
    <div class="mb-3">
      <label for="classroomId" class="form-label">Aula</label>
      <select id="classroomId" formControlName="classroomId" class="form-select"
              [class.is-invalid]="editSubjectForm.get('classroomId')?.invalid && editSubjectForm.get('classroomId')?.touched">
        <option [ngValue]="null" disabled>Seleccione un aula</option>
        <option *ngFor="let classroom of classrooms" [ngValue]="classroom.classroomId">{{ classroom.name }} ({{ classroom.building }})</option>
      </select>
      <div *ngIf="editSubjectForm.get('classroomId')?.invalid && editSubjectForm.get('classroomId')?.touched" class="invalid-feedback">
        Aula es requerida.
      </div>
    </div>

    <!-- Campo de Horario (ahora después de Aula) -->
    <div class="mb-3">
      <label for="scheduleId" class="form-label">Horario</label>
      <select id="scheduleId" formControlName="scheduleId" class="form-select"
              [class.is-invalid]="editSubjectForm.get('scheduleId')?.invalid && editSubjectForm.get('scheduleId')?.touched">
        <option [ngValue]="null" disabled>Seleccione un horario</option>
        <option *ngFor="let schedule of availableSchedules" [ngValue]="schedule.scheduleId">{{ schedule.days }} {{ schedule.schedule }}</option>
      </select>
      <div *ngIf="editSubjectForm.get('scheduleId')?.invalid && editSubjectForm.get('scheduleId')?.touched" class="invalid-feedback">
        Horario es requerido.
      </div>
    </div>
    ```

### 2.2. Validación de Conflictos de Aula y Docente

Se mejoró la validación en el método `onSubmit()` de `editar-subject.ts`.

**Cambios en `src/app/components/administracion/sub-componets/editar-subject/editar-subject.ts`:**

1.  **Uso de `getRawValue()`:** Se cambió `this.editSubjectForm.value` a `this.editSubjectForm.getRawValue()` para asegurar que todos los valores del formulario, incluyendo los campos deshabilitados como `subjectId`, se incluyan al enviar los datos.
    ```typescript
    onSubmit(): void {
      // ...
      if (this.editSubjectForm.valid && this.subjectAssignedId) {
        const formValues = this.editSubjectForm.getRawValue(); // Usar getRawValue para incluir campos deshabilitados
        // ...
      }
      // ...
    }
    ```
2.  **Validación de conflicto de aula/horario:** Se mantuvo la validación existente, pero ahora se complementa con el filtrado dinámico.
    ```typescript
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
    ```
3.  **Validación de conflicto de docente:** Se añadió una nueva validación para el docente.
    ```typescript
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
    ```

### 2.3. Corrección de Visualización del Nombre de la Materia

Se corrigió el error `TS2339` y se aseguró que el nombre de la materia se muestre correctamente.

**Cambios en `src/app/components/administracion/sub-componets/editar-subject/editar-subject.ts`:**

1.  **Añadir `subjectName` al formulario:** Se incluyó `subjectName` en la definición del formulario como un control deshabilitado.
    ```typescript
    this.editSubjectForm = this.fb.group({
      subjectId: [{ value: '', disabled: true }, Validators.required],
      subjectName: [{ value: '', disabled: true }, Validators.required], // Añadir subjectName al formulario
      // ...
    });
    ```
2.  **Parchear `subjectName`:** Se aseguró que el valor de `subjectName` se parchee en el formulario cuando se cargan los datos de la materia.
    ```typescript
    loadSubjectAssigned(id: number): void {
      // ...
      next: (data: any) => {
        // ...
        this.editSubjectForm.patchValue({
          subjectId: data.subjectId,
          subjectName: data.subjectName, // Parchear el nombre de la materia
          // ...
        });
        // ...
      },
      // ...
    }
    ```

**Cambios en `src/app/components/administracion/sub-componets/editar-subject/editar-subject.html`:**

1.  **Mostrar `subjectName` desde el formulario:** Se reemplazó la referencia incorrecta `{{subject.subjectName}}` por un campo de entrada de texto de solo lectura que muestra el valor de `subjectName` del formulario.
    ```html
    <div class="mb-3">
      <label for="subjectName" class="form-label">Nombre de Materia</label>
      <input type="text" id="subjectName" formControlName="subjectName" class="form-control" readonly>
    </div>
    ```

### 2.4. Aplicación de Página de Carga a `editar-usuario`

Se replicó la funcionalidad de la página de carga en el componente `editar-usuario`.

**Cambios en `src/app/components/administracion/sub-componets/editar-usuario/editar-usuario.ts`:**

1.  **Propiedad `isLoading`:** Se añadió la propiedad `isLoading` para controlar el estado de carga.
    ```typescript
    export class EditarUsuario implements OnInit {
      // ...
      erroMSG: string = '';
      isLoading = true; // Propiedad para controlar el estado de carga
      // ...
    }
    ```
2.  **Control de `isLoading`:** Se activó y desactivó `isLoading` durante la carga de datos del usuario.
    ```typescript
    ngOnInit(): void {
      // ...
      if (this.username) {
        this.loadUser(this.username);
      } else {
        this.erroMSG = 'No se proporcionó nombre de usuario.';
        this.isLoading = false; // Finalizar carga si no hay nombre de usuario
      }
    }

    loadUser(username: string): void {
      this.isLoading = true; // Indicar que se está cargando
      this.userService.getUserByUsername(username).subscribe({
        next: (data: any) => {
          // ...
          this.isLoading = false; // Finalizar carga
        },
        error: (err: any) => {
          // ...
          this.isLoading = false; // Finalizar carga
        }
      });
    }
    ```
3.  **Importación de `MatIconModule`:** Se añadió `MatIconModule` a los imports para soportar el ícono de "Volver" en la plantilla.
    ```typescript
    import { MatIconModule } from '@angular/material/icon'; // Importar MatIconModule

    @Component({
      // ...
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule // Añadir MatIconModule a los imports
      ],
      // ...
    })
    ```

**Cambios en `src/app/components/administracion/sub-componets/editar-usuario/editar-usuario.html`:**

1.  **Elementos de carga:** Se añadió la estructura HTML para mostrar el spinner de carga y el mensaje, similar a `editar-subject.html`.
    ```html
    <div class="container mt-4">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h2>Editar Usuario</h2>
          <button class="btn btn-secondary" (click)="router.navigate(['/home/administracion/usuarios'])">
            <mat-icon>arrow_back</mat-icon> Volver
          </button>
        </div>
        <div class="card-body">
          <div *ngIf="isLoading" class="text-center">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando usuario...</p>
          </div>

          <div *ngIf="erroMSG" class="alert alert-danger">
            {{ erroMSG }}
          </div>

          <div *ngIf="user && !isLoading && !erroMSG">
            <!-- Formulario de edición de usuario -->
          </div>
        </div>
      </div>
    </div>
    ```
2.  **Eliminación de `div` redundante:** Se eliminó un `div` extra con la clase `container-general` que estaba envolviendo el contenido, para mantener la consistencia con el estilo de `editar-subject.html`.

### 2.5. Reversión del Cambio Temporal en el Modal de Inicio de Sesión

Se restauró la funcionalidad original del modal de inicio de sesión en `src/app/components/login/login.ts`.

**Cambios en `src/app/components/login/login.ts`:**

1.  **Restauración del modal:** Se descomentó el código que abre el `SuccessModal` después de un inicio de sesión exitoso, eliminando la navegación directa a `/home`.
    ```typescript
    login(): void {
      this.authService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe({
        next: () => {
          this.modalService.open(SuccessModal, { centered: true }).result.then(
            (result) => {
              if (result === 'confirm') {
                this.router.navigateByUrl('/home');
              }
            },
            (reason) => {
              // Manejar el cierre del modal si es necesario
            }
          );
        },
        // ...
      });
    }
    ```

## 3. Conclusión

Con estos cambios, el componente de edición de materias asignadas ahora ofrece una experiencia de usuario mejorada con filtrado dinámico de horarios y validaciones robustas. Además, el componente de edición de usuarios ahora incluye una página de carga, y la funcionalidad del modal de inicio de sesión ha sido restaurada.
