import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment'; // Cambiado a environment
import { SubjectAssignedDTO } from '../models/subject.model'; // Importar SubjectAssignedDTO

@Injectable({
  providedIn: 'root',
})
export class AssigenedSubjectService {
  private apiUrl = `${environment.apiUrl}/subject-assignments`; // Nueva URL base para materias asignadas

  private _subjectsChanged = new Subject<void>(); // Create a Subject
  subjectsChanged$ = this._subjectsChanged.asObservable(); // Expose as Observable

  constructor (private httpClient:HttpClient,private authService:AuthService){}
  
  //Tomar todos las materias
  getAllsubjects():Observable<any[]>{
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization:`Bearer ${token}`
    });

      return this.httpClient.get<any[]>(`${this.apiUrl}/all`,{headers}); // Usar apiUrl
  }
  //fin tomar todos las materias

  getSubjectAssignedById(id: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.httpClient.get<any>(`${this.apiUrl}/${id}`, { headers });
  }

  updateSubjectAssigned(id: number, dto: SubjectAssignedDTO): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.httpClient.put<any>(`${this.apiUrl}/update/${id}`, dto, { headers });
  }

  createSubjectAssigned(dto: SubjectAssignedDTO): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.httpClient.post<any>(`${this.apiUrl}/create`, dto, { headers });
  }

   // Método para notificar a los suscriptores que los datos de las materias han cambiado
    notifySubjectsChanged() {
      this._subjectsChanged.next();
    }
}
