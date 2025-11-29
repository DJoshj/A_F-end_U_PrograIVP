import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service';
import { Observable, Subject, of } from 'rxjs'; 
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {

   constructor (private httpclient:HttpClient,private authService:AuthService){}


  //get all subject 

  getAllSubject():Observable<any[]>{
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.httpclient.get<any>(`${environment.getAllSubjectUrl}`,{headers});
  }

  // fin get all subject

  
}
