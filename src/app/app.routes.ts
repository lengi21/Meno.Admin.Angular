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
    { path: 'menus', loadComponent: () => import('./features/menus/menus.component').then((m) => m.MenusComponent) },
    { path: 'categories', loadComponent: () => import('./features/categories/categories.component').then((m) => m.CategoriesComponent) },
    { path: 'dishes', loadComponent: () => import('./features/dishes/dishes.component').then((m) => m.DishesComponent) },
    { path: 'analytics', loadComponent: () => import('./features/analytics/analytics.component').then((m) => m.AnalyticsComponent) },
    { path: 'audit', loadComponent: () => import('./features/audit/audit.component').then((m) => m.AuditComponent) },
    { path: '', pathMatch: 'full', redirectTo: 'settings' },
  ] },
  { path: '**', redirectTo: 'sign-in' },
];
