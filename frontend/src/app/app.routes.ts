import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public events listing
  {
    path: 'events',
    loadComponent: () =>
      import('./features/events/event-list.component').then(
        (m) => m.EventListComponent
      ),
  },

  // Create Event — college_admin only (super_admin removed per your rule)
  {
    path: 'admin/create-event',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['college_admin', 'super_admin'] },
    loadComponent: () =>
      import('./features/events/create-event.component').then(
        (m) => m.CreateEventComponent
      ),
  },

  // Create College — super_admin only
  {
    path: 'admin/create-college',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['super_admin'] },
    loadComponent: () =>
      import('./features/admin/create-college.component').then(
        (m) => m.CreateCollegeComponent
      ),
  },

  // Create College Admin — super_admin only
  {
    path: 'admin/create-college-admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['super_admin'] },
    loadComponent: () =>
      import('./features/admin/create-college-admin.component').then(
        (m) => m.CreateCollegeAdminComponent
      ),
  },

  // Super Admin Dashboard
  {
  path: 'admin/dashboard',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['super_admin'] },
  loadComponent: () =>
    import('./features/admin/super-admin-dashboard.component')
      .then(m => m.SuperAdminDashboardComponent),
},

  // Auth routes
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then(
        (m) => m.RegisterComponent
      ),
  },

  // Default redirect
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'events',
  },
  
];