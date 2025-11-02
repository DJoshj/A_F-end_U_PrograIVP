import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/home/home';
import { Estudiantes } from './components/estudiantes/estudiantes';
import { Profile } from './components/profile/profile';

export const routes: Routes = [
    {path: 'login', component: Login},
    {path:'home',component:Home,children:[
        {path:'estudiantes',component:Estudiantes},
        {path:'profile',component:Profile}
    ]

    },
    {path: '', redirectTo: 'login', pathMatch: 'full'},
];
    