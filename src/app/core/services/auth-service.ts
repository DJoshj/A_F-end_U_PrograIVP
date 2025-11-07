import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private LOGIN_URL = 'http://localhost:8080/api/v1/login'; //esto ire en invoroments mas tarde
  private tokenKey = 'authToken';

  constructor(private httpClient: HttpClient, private router: Router) {

  }


  //este es el metodo que obtiene e token de login de nuestra app

  login(user: string, password: string): Observable<any> {
    return this.httpClient.post<any>(this.LOGIN_URL, { user, password }).pipe(
      tap(response => {
        if (response.token) {
          console.log(response.token);
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
  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }


  //validamos tiempo de expiracion y si existe en el ocal storage
  isAuthenticated(): boolean{
    const token = this.getToken(); //recuperamos token
    if(!token){return false;}

        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
        return Date.now() < exp;
  }


  //cerrar secion
logout():void{
  localStorage.removeItem(this.tokenKey);
  this.router.navigateByUrl('/login');
}




}
