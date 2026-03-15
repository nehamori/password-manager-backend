import { Component, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiClient } from '../../../services/api';
import { LoginFSM } from '../../../services/login_fsm';
import { DiscordWidget } from "../discord-widget";
import { TelegramWidget } from "../telegram-widget";

@Component({
    selector: 'app-login-auth-widgets',
    imports: [TelegramWidget, DiscordWidget],
    templateUrl: './index.html',
})
export class AuthWidgets {
    discordClientId = '';
    discordRedirectUri = '';

    telegramBotName = '';
    telegramWidgetReady: WritableSignal<boolean> = signal(false);
    discordWidgetReady: WritableSignal<boolean> = signal(false);

    constructor(private api: ApiClient, readonly loginFsm: LoginFSM, private route: ActivatedRoute) { }

    async ngOnInit() {
        await Promise.all([
            this.initTelegramWidget(), this.initDiscordWidget()
        ]);

        const isWebsiteLogin = this.route.snapshot.queryParamMap.get('native') !== '1';
        this.loginFsm.setupIsWebsiteLogin(isWebsiteLogin);
    }

    private async initDiscordWidget() {
        const discordLoginData = await this.api.getDiscordLoginData();
        this.discordClientId = discordLoginData.clientId;
        this.discordRedirectUri = window.location.origin + window.location.pathname + "/discord";
        this.discordWidgetReady.set(true);
    }

    private async initTelegramWidget() {
        const telegramLoginData = await this.api.getTelegramLoginData();
        this.telegramBotName = telegramLoginData.telegramBotName;
        this.telegramWidgetReady.set(true);
    }

    async telegramAuth(data: any) {
        await this.loginFsm.loginByTelegram(data);
    }
}
