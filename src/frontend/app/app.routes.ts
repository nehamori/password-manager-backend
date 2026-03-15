import { Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { Home } from './pages/home';
import { DiscordCallbackPage, EnterPassword, Login } from './pages/login';

const homeRoutes: Routes = !environment.isElectron
    ? [{ path: '', component: Home }]
    : [];

const electronRootRoutes: Routes = environment.isElectron
    ? [{ path: '', redirectTo: 'login', pathMatch: 'full' as const }]
    : [];

export const routes: Routes = [
    ...homeRoutes,
    ...electronRootRoutes,
    { path: 'login', component: Login },
    { path: 'login/discord', component: DiscordCallbackPage },
    { path: 'login/enter-password', component: EnterPassword },
    { path: '**', redirectTo: environment.isElectron ? 'login' : '' },
];
