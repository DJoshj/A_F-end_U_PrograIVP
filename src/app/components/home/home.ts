import { Component, OnInit } from '@angular/core';
import { MatButton, MatAnchor } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../core/services/auth-service';


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
export class Home implements OnInit {

  username: string | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.username = this.authService.getUsername();
  }

  //metodos
  logout(): void {
    this.authService.logout();
  }
}
