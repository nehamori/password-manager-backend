import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthWidgets } from "../../components/login";
import { LoginFSM } from '../../services/login_fsm';

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
export class Login implements OnInit {
    readonly isElectron = environment.isElectron;
    readonly nativeLoginUrl = environment.websiteLoginUrl;
    readonly isResuming = signal(false);

    constructor(private loginFsm: LoginFSM) { }

    async ngOnInit() {
        if (this.isElectron) return;

        this.isResuming.set(true);
        try {
            await this.loginFsm.tryResumeLogin();
        } finally {
            this.isResuming.set(false);
        }
    }

    openWebsiteLogin(): void {
        const electronApi = (window as Window & { blinkpassElectron?: BlinkpassElectronApi }).blinkpassElectron;

        if (this.isElectron && electronApi?.openExternal) {
            void electronApi.openExternal(this.nativeLoginUrl);
            return;
        }

        window.location.href = this.nativeLoginUrl;
    }
}
