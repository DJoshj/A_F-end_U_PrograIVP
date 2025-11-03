import { Component } from '@angular/core';
import {MatFormField, MatInputModule} from '@angular/material/input';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-mostrar-estudiantes',
  imports: [
    MatInputModule,
    MatFormField,
    MatIconModule
],
  templateUrl: './mostrar-estudiantes.html',
  styleUrl: './mostrar-estudiantes.css',
})
export class MostrarEstudiantes {

}
