import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {

    private _usersChanged = new Subject<void>(); // Create a Subject
    usersChanged$ = this._usersChanged.asObservable(); // Expose as Observable

  constructor (private httpClient:HttpClient,private authService:AuthService){}
  
  //Tomar todos los usuairo
  getAllsubjects():Observable<any[]>{
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization:`Bearer ${token}`
    });

      return this.httpClient.get<any[]>(`${environment.getAllSubjetsURl}`,{headers});
  }
  //fin tomar todos los usuarios


   // Método para notificar a los suscriptores que los datos de las materias han cambiado
    notifyUsersChanged() {
      this._usersChanged.next();
    }


}
