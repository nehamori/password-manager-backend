import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';

import { DiscordWidget, TelegramWidget } from "../../components/login";
import { ApiClient } from '../../services/api';
import { ClientEncryption } from '../../services/client-encryption';

export { DiscordCallbackPage } from './discord';
export { EnterPassword } from './enter-password';

@Component({
    selector: 'app-login',
    imports: [CommonModule, TelegramWidget, DiscordWidget],
    templateUrl: './index.html',
})
export class Login implements OnInit {
    mode: 'login' | 'register' = 'login';

    discordClientId = '';
    discordRedirectUri = '';

    telegramBotName = '';
    telegramWidgetReady: WritableSignal<boolean> = signal(false);
    discordWidgetReady: WritableSignal<boolean> = signal(false);

    constructor(private api: ApiClient, private clientEncryption: ClientEncryption, private router: Router) { }

    async ngOnInit() {
        await Promise.all([
            this.initTelegramWidget(), this.initDiscordWidget()
        ]);
    }

    private async initDiscordWidget() {
        const discordLoginData = await this.api.getDiscordLoginData();
        this.discordClientId = discordLoginData.clientId;
        this.discordRedirectUri = window.location.href + "/discord";
        this.discordWidgetReady.set(true);
    }

    private async initTelegramWidget() {
        const telegramLoginData = await this.api.getTelegramLoginData();
        this.telegramBotName = telegramLoginData.telegramBotName;
        this.telegramWidgetReady.set(true);
    }

    showLogin() {
        this.mode = 'login';
    }

    showRegister() {
        this.mode = 'register';
    }

    async telegramAuth(data: any) {
        await this.clientEncryption.loginByTelegram(data);
    }
}
