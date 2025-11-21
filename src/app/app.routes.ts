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
import { Subjects } from './components/administracion/sub-componets/subjects/subjects';
import { EditarSubject } from './components/administracion/sub-componets/editar-subject/editar-subject'; // Importar EditarSubject
import { AuthorizationGuard } from './guards/authorizationGuard'; // Asegurarse de que AuthorizationGuard esté importado
import { UserRole } from './enums/enums'; // Importar UserRole

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
                        { path: 'subjects', component: Subjects },
                        {
                          path: 'editarSubject/:id',
                          component: EditarSubject,
                          canActivate: [AuthGuardGuard, AuthorizationGuard],
                          data: { roles: [UserRole.ADMIN] }
                        }
                    ]
            },
        ]

    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
];
