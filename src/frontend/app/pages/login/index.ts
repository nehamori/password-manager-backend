import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthWidgets } from "../../components/login";

type BlinkpassElectronApi = {
    openExternal?: (url: string) => Promise<void>;
};

export { DiscordCallbackPage } from './discord';
export { EnterPassword } from './enter-password';

@Component({
    selector: 'app-login',
    imports: [CommonModule, AuthWidgets, RouterLink],
    templateUrl: './index.html',
})
export class Login {
    readonly isElectron = environment.isElectron;
    readonly nativeLoginUrl = environment.websiteLoginUrl;

    openWebsiteLogin(): void {
        const electronApi = (window as Window & { blinkpassElectron?: BlinkpassElectronApi }).blinkpassElectron;

        if (this.isElectron && electronApi?.openExternal) {
            void electronApi.openExternal(this.nativeLoginUrl);
            return;
        }

        window.location.href = this.nativeLoginUrl;
    }
}
