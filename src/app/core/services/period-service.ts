  import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class PeriodService {
  private apiUrl = `${environment.apiUrl}/periods`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllPeriods(): Observable<any[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers });
  }

  getPeriodById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
