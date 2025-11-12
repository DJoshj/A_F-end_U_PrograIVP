import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthGuardGuard } from './guards/auth-guard-guard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  providers:[],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'ProjectoFronEnd';
}
