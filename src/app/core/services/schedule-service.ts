import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl = `${environment.apiUrl}/schedules`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllSchedules(): Observable<any[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers });
  }

  getScheduleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
