import { Routes } from '@angular/router';
import { Home } from './pages/home';
import { DiscordCallbackPage, EnterPassword, Login } from './pages/login';
import { environment } from '../environments/environment';

export const routes: Routes = [
    ...(!environment.isElectron ? [{ path: '', component: Home }] : []),
    { path: 'login', component: Login },
    { path: 'login/discord', component: DiscordCallbackPage },
    { path: 'login/enter-password', component: EnterPassword },
    { path: '**', redirectTo: '' },
];
