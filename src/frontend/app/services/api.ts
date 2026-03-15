import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';


@Injectable({
    providedIn: 'root',
})
export class ApiClient {
    constructor(private http: HttpClient) { }

    getTelegramLoginData() {
        return firstValueFrom(this.http.get<TelegramLoginData>(
            environment.baseApiUrl + 'auth/login/telegram/login_data'
        ));
    }

    loginByTelegram(data: TelegramLoginData) {
        return firstValueFrom(this.http.post<LoginResponse>(
            environment.baseApiUrl + 'auth/login/telegram',
            { telegramData: data }
        ));
    }

    getDiscordLoginData() {
        return firstValueFrom(this.http.get<DiscordLoginData>(
            environment.baseApiUrl + 'auth/login/discord/login_data'
        ));
    }

    loginByDiscord(data: DiscordLoginRequest) {
        return firstValueFrom(this.http.post<LoginResponse>(
            environment.baseApiUrl + 'auth/login/discord', data
        ));
    }

    loginComplete(loginToken: string, payload: { challengeProof?: string; verifier?: string }) {
        return firstValueFrom(this.http.post<LoginCompleteResponse>(
            environment.baseApiUrl + 'auth/login/complete',
            { loginToken, ...payload }
        ));
    }

    getMe() {
        return firstValueFrom(this.http.get<User>(
            environment.baseApiUrl + 'auth/me',
            { withCredentials: true }
        ));
    }
}
