import { Routes } from '@angular/router';
import { AdminSignInComponent } from './features/auth/admin-sign-in.component';
import { AdminShellComponent } from './layout/admin-shell.component';
import { adminAuthGuard } from './core/auth/admin-auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'sign-in' },
  { path: 'sign-in', component: AdminSignInComponent },
  { path: '', component: AdminShellComponent, canActivate: [adminAuthGuard], children: [
    { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent) },
    { path: 'staff', loadComponent: () => import('./features/staff/staff.component').then((m) => m.StaffComponent) },
    { path: 'roles', loadComponent: () => import('./features/roles/roles.component').then((m) => m.RolesComponent) },
    { path: '', pathMatch: 'full', redirectTo: 'settings' },
  ] },
  { path: '**', redirectTo: 'sign-in' },
];
