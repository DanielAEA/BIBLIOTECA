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

import { SettingsComponent } from './dashboard/admin-dashboard/settings/settings.component';
import { BooksComponent } from './dashboard/admin-dashboard/books/books.component';
import { AuthorsComponent } from './dashboard/admin-dashboard/catalog/authors.component';
import { EditorialsComponent } from './dashboard/admin-dashboard/catalog/editorials.component';
import { GenresComponent } from './dashboard/admin-dashboard/catalog/genres.component';
import { EjemplaresComponent } from './dashboard/admin-dashboard/ejemplares/ejemplares.component';
import { ResenasComponent } from './dashboard/admin-dashboard/resenas/resenas.component';
import { SalasComponent } from './dashboard/admin-dashboard/salas/salas.component';
import { StatisticsComponent } from './dashboard/admin-dashboard/statistics/statistics.component';

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
      { path: 'settings', component: SettingsComponent },
      { path: 'books', component: BooksComponent },
      { path: 'authors', component: AuthorsComponent },
      { path: 'editorials', component: EditorialsComponent },
      { path: 'genres', component: GenresComponent },
      { path: 'ejemplares', component: EjemplaresComponent },
      { path: 'resenas', component: ResenasComponent },
      { path: 'salas', component: SalasComponent },
      { path: 'statistics', component: StatisticsComponent },
      { path: '', redirectTo: 'statistics', pathMatch: 'full' }
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
