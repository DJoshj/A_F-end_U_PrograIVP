import { Component } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLinkWithHref,
  ],
  templateUrl: './estudiantes.html',
  styleUrl: './estudiantes.css',
})
export class Estudiantes {

}
