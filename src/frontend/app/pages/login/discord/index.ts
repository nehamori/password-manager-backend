import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClientEncryption } from '../../../services/client-encryption';

@Component({
    selector: 'app-discord',
    imports: [RouterLink],
    templateUrl: './index.html',
})
export class DiscordCallbackPage implements OnInit {
    processFinished = signal(false);
    hasError = signal(false);
    statusMessage = signal(
        'BlinkPass is validating the Discord response and preparing the authenticated session.'
    );

    constructor(private clientEncryption: ClientEncryption, private router: Router) { }

    async ngOnInit() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const redirectUri = window.location.origin + window.location.pathname;

        if (!code) {
            this.hasError.set(true);
            this.statusMessage.set('Discord did not return an authorization code. Please try signing in again.');
            this.processFinished.set(true);
            return;
        }

        try {
            await this.clientEncryption.loginByDiscord({ code: code, redirectUri: redirectUri });
        } catch (error) {
            this.hasError.set(true);
            this.statusMessage.set(this.getErrorMessage(error));
        } finally {
            this.processFinished.set(true);
        }
    }

    private getErrorMessage(error: unknown): string {
        if (error instanceof Error && error.message) {
            return error.message;
        }

        return 'Discord sign in failed. Please try again.';
    }
}
