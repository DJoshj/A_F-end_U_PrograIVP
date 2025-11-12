import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service';
import { environment } from '../../../environments/environment.development';
import { Observable, Subject } from 'rxjs'; // Import Subject
import { Usuarios } from '../../components/administracion/sub-componets/usuarios/usuarios'; // Keep if still used elsewhere, otherwise remove

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private _usersChanged = new Subject<void>(); // Create a Subject
  usersChanged$ = this._usersChanged.asObservable(); // Expose as Observable

    constructor (private httpclient:HttpClient,private authService:AuthService){}

    getUsers():Observable<any[]>{
      const token = this.authService.getToken();

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      
      return this.httpclient.get<any[]>(`${environment.UserUrl}`,{headers});
    }


    //obtener usuario por ID
    public getUserByID(id: number):Observable<Array<Usuarios>>{
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      return this.httpclient.get<Array<Usuarios>>(`${environment.GetUserByIdUrl}${id}`,{headers});
    }

    //obtener usuario por username
    public getUserByUsername(username: string):Observable<Array<Usuarios>>{
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      return this.httpclient.get<Array<Usuarios>>(`${environment.GetUserByUsernameUrl}${username}`,{headers});
    }

    // Create user
    public createUser(userData: any, rolId: number): Observable<any> {
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      return this.httpclient.post<any>(`${environment.createUserUrl}/${rolId}`, userData, { headers });
    }

    // Method to notify subscribers that users data has changed
    notifyUsersChanged() {
      this._usersChanged.next();
    }
}
