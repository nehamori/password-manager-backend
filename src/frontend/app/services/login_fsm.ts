import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiClient } from './api';
import { CryptoService } from './crypto';
import { UserService } from './user';

@Injectable({
    providedIn: 'root',
})
export class LoginFSM {
    pendingLogin = signal<LoginResponse | null>(null);
    encryptionKey = signal<Uint8Array | null>(null);

    constructor(private api: ApiClient, private router: Router, private userService: UserService) { }

    setupIsWebsiteLogin(isWebsiteLogin: boolean) {
        sessionStorage.setItem('is_website_login', isWebsiteLogin ? '1' : '0');
    }

    isWebsiteLogin(): boolean {
        return sessionStorage.getItem('is_website_login') === '1';
    }

    async loginByTelegram(data: TelegramLoginData) {
        await this.loginProcess(await this.api.loginByTelegram(data));
    }

    async loginByDiscord(data: DiscordLoginRequest) {
        await this.loginProcess(await this.api.loginByDiscord(data));
    }

    async loginByBrowserData(data: string) {
        const decodedData = this.decodeLoginData(data);

        this.setupIsWebsiteLogin(true);
        this.pendingLogin.set(decodedData);
        await this.router.navigate(['/login/enter-password']);
    }

    async completeLogin(password: string): Promise<void> {
        const pending = this.pendingLogin();
        if (!pending) throw new Error('No pending login');

        const { loginToken, loginChallenge, isNewUser } = pending;

        const saltBytes = new TextEncoder().encode(loginChallenge.salt);
        const masterKey = await CryptoService.deriveKey(password, saltBytes);
        const verifier = CryptoService.bytesToHex(masterKey);

        if (isNewUser) {
            const result = await this.api.loginComplete(loginToken, { verifier });
            this.userService.setUser(result.user);
        } else {
            const hmacKey = new TextEncoder().encode(verifier);
            const challengeBytes = CryptoService.hexToBytes(loginChallenge.challenge);
            const proofBytes = await CryptoService.hmacSHA256(hmacKey, challengeBytes);
            const challengeProof = CryptoService.bytesToHex(proofBytes);

            const result = await this.api.loginComplete(loginToken, { challengeProof });
            this.userService.setUser(result.user);
        }

        this.encryptionKey.set(masterKey);
        this.pendingLogin.set(null);
        
        this.router.navigate(['/dashboard']);
    }

    private async loginProcess(data: LoginResponse): Promise<void> {
        if (this.isWebsiteLogin()) {
            this.pendingLogin.set(data);
            this.router.navigate(['/login/enter-password']);
        } else {
            const loginDataBase64 = this.encodeLoginData(data);
            window.location.href = `blinkpass://login?data=${encodeURIComponent(loginDataBase64)}`;
        }
    }

    private encodeLoginData(data: LoginResponse): string {
        const json = JSON.stringify(data);
        const bytes = new TextEncoder().encode(json);
        let binary = '';

        for (const byte of bytes) {
            binary += String.fromCharCode(byte);
        }

        return btoa(binary);
    }

    private decodeLoginData(data: string): LoginResponse {
        const binary = atob(data);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        const json = new TextDecoder().decode(bytes);

        return JSON.parse(json) as LoginResponse;
    }
}
