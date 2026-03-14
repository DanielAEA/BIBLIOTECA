import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

// Login
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

// Dashboards
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard.component';
import { BibliotecarioDashboardComponent } from './dashboard/bibliotecario-dashboard/bibliotecario-dashboard.component';
import { ClienteDashboardComponent } from './dashboard/cliente-dashboard/cliente-dashboard.component';

import { ConfiguracionComponent } from './dashboard/admin-dashboard/configuracion/configuracion.component';
import { LibrosComponent } from './dashboard/admin-dashboard/libros/libros.component';
import { AutoresComponent } from './dashboard/admin-dashboard/catalogo/autores.component';
import { EditorialesComponent } from './dashboard/admin-dashboard/catalogo/editoriales.component';
import { GenerosComponent } from './dashboard/admin-dashboard/catalogo/generos.component';
import { EjemplaresComponent } from './dashboard/admin-dashboard/ejemplares/ejemplares.component';
import { ResenasComponent } from './dashboard/admin-dashboard/resenas/resenas.component';
import { SalasComponent } from './dashboard/admin-dashboard/salas/salas.component';
import { EstadisticasComponent } from './dashboard/admin-dashboard/estadisticas/estadisticas.component';
import { UsuariosComponent } from './dashboard/admin-dashboard/usuarios/usuarios.component';

// Not Authorized
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: 'configuracion', component: ConfiguracionComponent },
      { path: 'libros', component: LibrosComponent },
      { path: 'autores', component: AutoresComponent },
      { path: 'editoriales', component: EditorialesComponent },
      { path: 'generos', component: GenerosComponent },
      { path: 'ejemplares', component: EjemplaresComponent },
      { path: 'resenas', component: ResenasComponent },
      { path: 'salas', component: SalasComponent },
      { path: 'estadisticas', component: EstadisticasComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: '', redirectTo: 'estadisticas', pathMatch: 'full' }
    ]
  },

  {
    path: 'bibliotecario',
    component: BibliotecarioDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BIBLIOTECARIO'] }
  },

  {
    path: 'cliente',
    component: ClienteDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CLIENTE'] },
    children: [
      { path: 'prestamos', loadComponent: () => import('./dashboard/cliente-dashboard/mis-prestamos/mis-prestamos.component').then(m => m.MisPrestamosComponent) },
      { path: 'catalogo', loadComponent: () => import('./dashboard/cliente-dashboard/catalogo/catalogo.component').then(m => m.CatalogoClienteComponent) },
      { path: 'salas', loadComponent: () => import('./dashboard/cliente-dashboard/reservar-salas/reservar-salas.component').then(m => m.ReservarSalasComponent) },
      { path: '', redirectTo: 'prestamos', pathMatch: 'full' }
    ]
  },

  { path: 'not-authorized', component: NotAuthorizedComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
