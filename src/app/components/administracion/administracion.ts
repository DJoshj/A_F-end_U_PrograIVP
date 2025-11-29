import { Component } from '@angular/core';
import { RouterLinkWithHref, RouterOutlet } from "@angular/router";
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLinkWithHref,
    NgbDropdownModule
  ],
  templateUrl: './administracion.html',
  styleUrl: './administracion.css',
})
export class Administracion {

}
