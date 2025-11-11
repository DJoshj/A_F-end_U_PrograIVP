import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Users {
  
    constructor (private httpclient:HttpClient,private authService:AuthService){}

    getUsers():Observable<any[]>{
      const token = this.authService.getToken();

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      
      return this.httpclient.get<any[]>(`${environment.UserUrl}`,{headers});
    }


}
