import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/home/home';
import { Estudiantes } from './components/estudiantes/estudiantes';
import { Profile } from './components/profile/profile';
import { MostrarEstudiantes } from './components/estudiantes/sub-component/mostrar-estudiantes/mostrar-estudiantes';
import { Administracion } from './components/administracion/administracion';

export const routes: Routes = [
    {path: 'login', component: Login},
    {path:'home',component:Home,children:[
        {path:'estudiantes',component:Estudiantes, children:[{path:'mostrarEstudiantes',component:MostrarEstudiantes}]},
        {path:'profile',component:Profile},
        {path:'administracion',component:Administracion}
    ]

    },
    {path: '', redirectTo: 'login', pathMatch: 'full'},
];
    