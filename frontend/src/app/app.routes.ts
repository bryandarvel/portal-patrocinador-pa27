import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    title: 'Entrar | Portal do Patrocinador',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  }
];
