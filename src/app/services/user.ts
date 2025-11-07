import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { User2Auth } from './authservice/auth2';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class User {

  constructor (private http:HttpClient){}

  getUser(id:number):Observable<User2Auth>{
    return this.http.get<User2Auth>(environment.urlApi + 'user/'+id).pipe(
      catchError(this.handleError)
    )
  }

  private handleError (error:HttpErrorResponse){
    if(error.status==0){
      console.error('Se ha produio un error',error.error);
    }else{
      console.error('backEnd retorno el codigo de estado',error.status,error.error);
    }
    return throwError(()=> new Error('Algo fallo, intente nuevamente'));
  }
  
}
