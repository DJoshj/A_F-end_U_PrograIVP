import { Component } from '@angular/core';
import { MatButton, MatAnchor } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import {MatListModule} from '@angular/material/list';
import { Auth } from '../../services/auth';


@Component({
  selector: 'app-home',
  imports: [
    RouterOutlet,
    MatIconModule,
    MatListModule,
    RouterLinkWithHref
],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  constructor(private authService:Auth){}

  //

  //metodos
  logout(){
    this.authService.logout;
  }


}
