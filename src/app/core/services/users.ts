import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service';
import { environment } from '../../../environments/environment.development';
import { Observable, Subject, of } from 'rxjs'; // Import Subject and of
import { map, catchError, tap } from 'rxjs/operators'; // Import map, catchError, and tap
import { User } from '../models/user.model'; // Import User model

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


    // Obtener usuario por ID
    public getUserByID(id: number):Observable<User | null>{ // Cambiado a User | null
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      return this.httpclient.get<User>(`${environment.GetUserByIdUrl}${id}`,{headers}).pipe(
        catchError(error => {
          console.error('Error al obtener usuario por ID:', error);
          return of(null);
        })
      );
    }

    // Obtener usuario por nombre de usuario
    public getUserByUsername(username: string):Observable<User | null>{ // Cambiado a User | null
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      return this.httpclient.get<User>(`${environment.GetUserByUsernameUrl}${username}`,{headers}).pipe(
        catchError(error => {
          console.error('Error al obtener usuario por nombre de usuario:', error);
          return of(null); // Retorna null para un solo usuario
        })
      );
    }

    // Crear usuario
    public createUser(userData: any, rolId: number): Observable<any> {
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      return this.httpclient.post<any>(`${environment.createUserUrl}/${rolId}`, userData, { headers });
    }

    //eliminar usuario
    public deleteUser(id:number):Observable<any | null>{
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }); 
      return this.httpclient.delete<any>(`${environment.DeleteUserUrl}/${id}`,{headers}).pipe(
            catchError(error => {
          console.error('Error al eliminar usuario:', error);
          return of(null); 
        })
      )
      
      ;
    }

    // Actualizar usuario
    public updateUser(id: number, userData: any): Observable<any> {
      const token = this.authService.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      return this.httpclient.put<any>(`${environment.UserUrl}/${id}`, userData, { headers }).pipe(
        tap(() => this.notifyUsersChanged()), // Notificar cambios después de una actualización exitosa
        catchError(error => {
          console.error('Error al actualizar usuario:', error);
          return of(null);
        })
      );
    }

    // metodo  para notificar por medio de subscripcion que los datos de usuarios han cambiado
    notifyUsersChanged() {
      this._usersChanged.next();
    }

    /**
     * Recupera el rol del usuario actual obteniendo sus datos completos del backend.
     * @returns Un Observable del ID de rol del usuario (número) o null si no se encuentra/error.
     */
    public getCurrentUserRole(): Observable<number | null> {
      const username = this.authService.getUsername();
      if (username) {
        return this.getUserByUsername(username).pipe(
          map(user => { // Cambiado de 'users' a 'user'
            if (user) {
              const userRole = user.roles;
              if (userRole && userRole.rolId) { // Asegurarse de que rolId existe
                return userRole.rolId;
              }
            }
            return null;
          }),
          catchError(error => {
            console.error('Error al obtener el rol del usuario:', error);
            return of(null);
          })
        );
      }
      return of(null);
    }
}
