import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private tokenKey = 'authToken';

  constructor(private httpClient: HttpClient, private router: Router) {

  }


  //este es el metodo que obtiene e token de login de nuestra app

  login(username: string, password: string): Observable<any> {
    return this.httpClient.post<any>(environment.loginURl, { username, password }).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token)
        }
      })
    )
  }

  // Este método nos permite almacenar el token
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Aquí recuperamos el token
  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Aquí obtenemos el nombre de usuario del token
  public getUsername(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const username = payload.sub || null; // 'sub' es el claim estándar para el sujeto (nombre de usuario)
        return username;
      } catch (e) {
        console.error('Error decodificando el token:', e);
        return null;
      }
    }
    return null;
  }


  // Validamos tiempo de expiración y si existe en el almacenamiento local
  isAuthenticated(): boolean {
    const token = this.getToken(); // recuperamos token
    if (!token) { return false; }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() < exp;
  }


  //cerrar secion
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigateByUrl('/login');
  }




}
