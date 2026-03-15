import { Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { Home } from './pages/home';
import { DiscordCallbackPage, EnterPassword, Login } from './pages/login';

export const routes: Routes = [
    ...(!environment.isElectron ? [{ path: '', component: Home }] : []),
    ...(environment.isElectron
        ? [{ path: '', redirectTo: 'login', pathMatch: 'full' }]
        : []),
    { path: 'login', component: Login },
    { path: 'login/discord', component: DiscordCallbackPage },
    { path: 'login/enter-password', component: EnterPassword },
    { path: '**', redirectTo: environment.isElectron ? 'login' : '' },
];
