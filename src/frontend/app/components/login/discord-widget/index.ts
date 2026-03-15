import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-discord-widget',
    imports: [],
    templateUrl: './index.html',
})
export class DiscordWidget {
    @Input({ required: true }) clientId!: string;
    @Input({ required: true }) redirectUri!: string;

    get authUrl(): string {
        const baseUrl = 'https://discord.com/oauth2/authorize';
        const params = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'code',
            redirect_uri: this.redirectUri,
            scope: 'identify+email',
        });
        return `${baseUrl}?${params.toString()}`;
    }

    onButtonClick(): void {
        window.location.href = this.authUrl;
    }
}
