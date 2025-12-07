import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/home/home';
import { Estudiantes } from './components/estudiantes/estudiantes';
import { Profile } from './components/profile/profile';
import { MostrarEstudiantes } from './components/estudiantes/sub-component/mostrar-estudiantes/mostrar-estudiantes';
import { Administracion } from './components/administracion/administracion';
import { Usuarios } from './components/administracion/sub-componets/usuarios/usuarios';
import { AuthGuardGuard } from './guards/auth-guard-guard';
import { EditarUsuario } from './components/administracion/sub-componets/editar-usuario/editar-usuario';
import { AssignedSubjects } from './components/administracion/sub-componets/assigned-subjects/assigned-subjects';
import { AsignarSubject } from './components/administracion/sub-componets/asignar-subject/asignar-subject';
import { AuthorizationGuard } from './guards/authorizationGuard'; // Asegurarse de que AuthorizationGuard esté importado
import { UserRole } from './enums/enums'; // Importar UserRole
import { ScheduleComponent } from './components/administracion/sub-componets/schedule/schedule'; // Nueva ruta
import { Materias } from './components/administracion/sub-componets/materias/materias';

export const routes: Routes = [
    { path: 'login', component: Login },
    {
        path: 'home', component: Home,
        canActivate: [AuthGuardGuard],
        children: [
            { path: 'estudiantes', component: Estudiantes, children: [{ path: 'mostrarEstudiantes', component: MostrarEstudiantes }] },
            { path: 'profile', component: Profile },
            {
                path: 'administracion', component: Administracion,
                    children: [
                        { path: 'usuarios', component: Usuarios },
                        { path: 'editaUsuario/:username', component: EditarUsuario },
                        { path: 'assigned-subjects', component: AssignedSubjects },
                        {
                          path: 'asignarSubject/:id',
                          component: AsignarSubject,
                          canActivate: [AuthGuardGuard, AuthorizationGuard],
                          data: { roles: [UserRole.ADMIN] }
                        },
                        {path:'subjects',component:Materias},
                        {
                          path:'schedule',
                          component:ScheduleComponent,
                        }
                    ]
            }
        ]

    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
];
