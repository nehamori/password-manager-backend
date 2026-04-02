import { Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { Dashboard } from './pages/dashboard';
import { DataTypesPage } from './pages/dashboard/data-types';
import { DataTypeCreatePage } from './pages/dashboard/data-types/create';
import { DataTypeEditPage } from './pages/dashboard/data-types/edit';
import { PasswordGeneratorPage } from './pages/dashboard/password-generator';
import { PasswordsPage } from './pages/dashboard/passwords';
import { SettingsPage } from './pages/dashboard/settings';
import { Home } from './pages/home';
import { DiscordCallbackPage, EnterPassword, Login } from './pages/login';

const homeRoutes: Routes = !environment.isElectron
    ? [{ path: '', component: Home }]
    : [];

const electronRootRoutes: Routes = environment.isElectron
    ? [{ path: '', redirectTo: 'dashboard', pathMatch: 'full' as const }]
    : [];

export const routes: Routes = [
    ...homeRoutes,
    ...electronRootRoutes,
    { path: 'login', component: Login },
    { path: 'login/discord', component: DiscordCallbackPage },
    { path: 'login/enter-password', component: EnterPassword },
    {
        path: 'dashboard',
        component: Dashboard,
        children: [
            { path: '', redirectTo: 'passwords', pathMatch: 'full' },
            { path: 'passwords', component: PasswordsPage },
            { path: 'password-generator', component: PasswordGeneratorPage },
            { path: 'data-types', component: DataTypesPage },
            { path: 'data-types/create', component: DataTypeCreatePage },
            { path: 'data-types/:id/edit', component: DataTypeEditPage },
            { path: 'settings', component: SettingsPage },
        ],
    },
    { path: '**', redirectTo: environment.isElectron ? 'dashboard' : '' },
];
