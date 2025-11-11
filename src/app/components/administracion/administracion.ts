import { Component } from '@angular/core';
import { RouterLinkWithHref, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-administracion',
  imports: [RouterOutlet,
    RouterLinkWithHref,
  ],
  templateUrl: './administracion.html',
  styleUrl: './administracion.css',
})
export class Administracion {

}
