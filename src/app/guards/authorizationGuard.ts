import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../core/services/auth-service';
import { Observable } from 'rxjs';

// in processss ////

@Injectable()
export class AuthorizationGuard{

  constructor(private authService:AuthService,private router:Router){ }


  canActivate(route:ActivatedRouteSnapshot,state:RouterStateSnapshot):Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree{
      if(this.authService.isAuthenticated())
        {
          let requiredRol = route.data['roles']
          return true

        }else{ this.router.navigateByUrl('/login');return false}
  }


};
