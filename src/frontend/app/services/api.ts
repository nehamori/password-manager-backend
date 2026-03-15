import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { BASE_API_URL } from '../app.config';


@Injectable({
    providedIn: 'root',
})
export class ApiClient {
    constructor(private http: HttpClient) { }

    getTelegramLoginData() {
        return firstValueFrom(this.http.get<TelegramLoginData>(
            BASE_API_URL + 'auth/login/telegram/login_data'
        ));
    }

    loginByTelegram(data: TelegramLoginData) {
        return firstValueFrom(this.http.post<LoginResponse>(
            BASE_API_URL + 'auth/login/telegram',
            { telegramData: data }
        ));
    }

    getDiscordLoginData() {
        return firstValueFrom(this.http.get<DiscordLoginData>(
            BASE_API_URL + 'auth/login/discord/login_data'
        ));
    }

    loginByDiscord(data: DiscordLoginRequest) {
        return firstValueFrom(this.http.post<LoginResponse>(
            BASE_API_URL + 'auth/login/discord', data
        ));
    }

    loginComplete(loginToken: string, payload: { challengeProof?: string; verifier?: string }) {
        return firstValueFrom(this.http.post<LoginCompleteResponse>(
            BASE_API_URL + 'auth/login/complete',
            { loginToken, ...payload }
        ));
    }
}
