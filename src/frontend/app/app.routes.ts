import { Routes } from '@angular/router';
import { Home } from './pages/home';
import { Login } from './pages/login';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: '**', redirectTo: '' },
];
