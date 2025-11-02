import { Component } from '@angular/core';
import { MatButton, MatAnchor } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import {MatListModule} from '@angular/material/list';


@Component({
  selector: 'app-home',
  imports: [
    RouterOutlet,
    MatIconModule,
    MatListModule,
    RouterLinkWithHref,
],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  menuClosed = false;

  toggleMenu() {
    this.menuClosed = !this.menuClosed;
  }

}
