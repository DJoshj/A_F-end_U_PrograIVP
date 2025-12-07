// schedule-service.ts
// Servicio para interactuar con la API de horarios.
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth-service';
import { environment } from '../../../environments/environment.development';
import { Schedule, ScheduleDTO } from '../models/schedule.model';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private apiUrl = `${environment.apiUrl}/schedules`;
  private schedulesChangedSubject = new BehaviorSubject<void>(undefined);

  // Observable para notificar cambios en los horarios
  schedulesChanged$ = this.schedulesChangedSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Notifica a los suscriptores que los horarios han cambiado
  notifySchedulesChanged(): void {
    this.schedulesChangedSubject.next(undefined);
  }

  // Obtiene los encabezados HTTP con el token de autorización
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Manejo de errores HTTP
  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error en ScheduleService:', error);
    return throwError(() => new Error('Error en el servicio de horarios.'));
  }

  // Obtener todos los horarios
  getAllSchedules(): Observable<Schedule[]> {
    return this.http
      .get<Schedule[]>(`${this.apiUrl}/all`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener un horario por ID
  getScheduleById(id: number): Observable<Schedule> {
    return this.http
      .get<Schedule>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Obtener horarios por día
  getSchedulesByDay(day: string): Observable<Schedule[]> {
    return this.http
      .get<Schedule[]>(`${this.apiUrl}/day/${day}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // Obtener todos los días distintos
  getAllDistinctDays(): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.apiUrl}/days`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Crear un nuevo horario
  createSchedule(schedule: ScheduleDTO): Observable<Schedule> {
    return this.http
      .post<Schedule>(`${this.apiUrl}/create`, schedule, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap(() => this.notifySchedulesChanged()),
        catchError(this.handleError)
      );
  }

  // Actualizar un horario existente
  updateSchedule(id: number, schedule: ScheduleDTO): Observable<Schedule> {
    return this.http
      .put<Schedule>(`${this.apiUrl}/update/${id}`, schedule, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap(() => this.notifySchedulesChanged()),
        catchError(this.handleError)
      );
  }

  // Eliminar un horario
  deleteSchedule(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/delete/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap(() => this.notifySchedulesChanged()),
        catchError(this.handleError)
      );
  }
}
