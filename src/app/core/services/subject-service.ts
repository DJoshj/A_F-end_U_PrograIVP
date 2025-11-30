import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service';
import { Observable, Subject, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  // Observable para notificar cambios en las materias
  private subjectsChangedSubject = new Subject<void>();
  subjectsChanged$ = this.subjectsChangedSubject.asObservable();

  constructor(private httpclient: HttpClient, private authService: AuthService) {}

  // Método para notificar que las materias han cambiado
  notifySubjectsChanged() {
    this.subjectsChangedSubject.next();
  }

  // Obtener todas las materias
  getAllSubject(): Observable<any[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.httpclient.get<any>(`${environment.getAllSubjectUrl}`, { headers });
  }

  // Crear una nueva materia
  createSubject(subject: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.httpclient.post<any>(`${environment.createSubjectUrl}`, subject, { headers });
  }

  // Eliminar una materia por ID
  deleteSubject(id: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.httpclient.delete<any>(`${environment.deleteSubjectUrl}${id}`, { headers });
  }

  // Buscar materias por código
  searchSubjectByCode(code: string): Observable<any[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.httpclient.get<any>(`${environment.searchSubjectByCodeUrl}${code}`, { headers }).pipe(
      map((data: any) => (data ? [data] : [])), // Si el backend devuelve un objeto, lo convierte en un array; si es null, devuelve un array vacío
      catchError((error) => {
        if (error.status === 404) {
          return of([]); // Si es 404, devuelve un array vacío
        }
        return throwError(() => error); // Propaga otros errores
      })
    );
  }

  // Obtener todas las carreras
  getAllCareers(): Observable<any[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.httpclient.get<any>(`${environment.getAllCareersUrl}`, { headers });
  }
}
