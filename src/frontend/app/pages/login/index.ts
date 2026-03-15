import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { AuthWidgets } from "../../components/login";

export { DiscordCallbackPage } from './discord';
export { EnterPassword } from './enter-password';

@Component({
    selector: 'app-login',
    imports: [CommonModule, AuthWidgets],
    templateUrl: './index.html',
})
export class Login { }
