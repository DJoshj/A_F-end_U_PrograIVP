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
          console.log('token tomado correctamente');
          this.setToken(response.token)
        }
      })
    )
  }

  //esete metodo nos permite alamacenar e token
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  //aqui recuperamos el token
  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  //aqui obtenemos el nombre de usuario del token
  public getUsername(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || null; // 'sub' is the standard claim for the subject (username)
      } catch (e) {
        console.error('Error decoding token:', e);
        return null;
      }
    }
    return null;
  }


  //validamos tiempo de expiracion y si existe en el ocal storage
  isAuthenticated(): boolean {
    const token = this.getToken(); //recuperamos token
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
