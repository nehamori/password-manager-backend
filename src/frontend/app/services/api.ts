import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import {
    DataTypeCreateRequest,
    DataTypeField,
    DataTypeFieldResponse,
    DataTypeListResponse,
    DataTypeResponse,
    DataTypeUpdateRequest,
    DiscordLoginData,
    DiscordLoginRequest,
    LoginCompleteResponse,
    LoginResponse,
    TelegramLoginData,
    User,
} from './models';


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

    loginResume() {
        return firstValueFrom(this.http.post<LoginResponse>(
            environment.baseApiUrl + 'auth/login/resume',
            {},
            { withCredentials: true }
        ));
    }

    loginComplete(loginToken: string, payload: { challengeProof?: string; verifier?: string }) {
        return firstValueFrom(this.http.post<LoginCompleteResponse>(
            environment.baseApiUrl + 'auth/login/complete',
            { loginToken, ...payload },
            { withCredentials: true }
        ));
    }

    getMe() {
        return firstValueFrom(this.http.get<User>(
            environment.baseApiUrl + 'auth/me',
            { withCredentials: true }
        ));
    }

    // Data Types CRUD Operations
    createDataType(request: DataTypeCreateRequest) {
        return firstValueFrom(this.http.post<DataTypeResponse>(
            environment.baseApiUrl + 'data/types',
            request,
            { withCredentials: true }
        ));
    }

    getDataTypes() {
        return firstValueFrom(this.http.get<DataTypeListResponse[]>(
            environment.baseApiUrl + 'data/types',
            { withCredentials: true }
        ));
    }

    getDataType(typeId: number) {
        return firstValueFrom(this.http.get<DataTypeResponse>(
            environment.baseApiUrl + `data/types/${typeId}`,
            { withCredentials: true }
        ));
    }

    updateDataType(typeId: number, request: DataTypeUpdateRequest) {
        return firstValueFrom(this.http.patch<DataTypeResponse>(
            environment.baseApiUrl + `data/types/${typeId}`,
            request,
            { withCredentials: true }
        ));
    }

    deleteDataType(typeId: number) {
        return firstValueFrom(this.http.delete<void>(
            environment.baseApiUrl + `data/types/${typeId}`,
            { withCredentials: true }
        ));
    }

    addFieldToDataType(typeId: number, field: DataTypeField) {
        return firstValueFrom(this.http.post<DataTypeFieldResponse>(
            environment.baseApiUrl + `data/types/${typeId}/fields`,
            field,
            { withCredentials: true }
        ));
    }

    updateField(typeId: number, fieldId: number, field: DataTypeField) {
        return firstValueFrom(this.http.patch<DataTypeFieldResponse>(
            environment.baseApiUrl + `data/types/${typeId}/fields/${fieldId}`,
            field,
            { withCredentials: true }
        ));
    }

    deleteField(typeId: number, fieldId: number) {
        return firstValueFrom(this.http.delete<void>(
            environment.baseApiUrl + `data/types/${typeId}/fields/${fieldId}`,
            { withCredentials: true }
        ));
    }
}
