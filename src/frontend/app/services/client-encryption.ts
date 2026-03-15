import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiClient } from './api';
import { CryptoService } from './crypto';

@Injectable({
    providedIn: 'root',
})
export class ClientEncryption {
    pendingLogin = signal<LoginResponse | null>(null);
    encryptionKey = signal<Uint8Array | null>(null);

    constructor(private api: ApiClient, private router: Router) { }

    async loginByTelegram(data: TelegramLoginData) {
        await this.loginProcess(await this.api.loginByTelegram(data));
    }

    async loginByDiscord(data: DiscordLoginRequest) {
        await this.loginProcess(await this.api.loginByDiscord(data));
    }

    async completeLogin(password: string): Promise<void> {
        const pending = this.pendingLogin();
        if (!pending) throw new Error('No pending login');

        const { loginToken, loginChallenge, isNewUser } = pending;

        // Derive master key: argon2id(password, utf8(salt))
        const saltBytes = new TextEncoder().encode(loginChallenge.salt);
        const masterKey = await CryptoService.deriveKey(password, saltBytes);
        const verifier = CryptoService.bytesToHex(masterKey);

        if (isNewUser) {
            await this.api.loginComplete(loginToken, { verifier });
        } else {
            // HMAC-SHA256(utf8(verifier), hexToBytes(challenge))
            // mirrors backend: hmac.new(verifier.encode(), bytes.fromhex(challenge), "sha256")
            const hmacKey = new TextEncoder().encode(verifier);
            const challengeBytes = CryptoService.hexToBytes(loginChallenge.challenge);
            const proofBytes = await CryptoService.hmacSHA256(hmacKey, challengeBytes);
            const challengeProof = CryptoService.bytesToHex(proofBytes);

            await this.api.loginComplete(loginToken, { challengeProof });
        }

        this.encryptionKey.set(masterKey);
        this.pendingLogin.set(null);
    }

    private async loginProcess(data: LoginResponse): Promise<void> {
        this.pendingLogin.set(data);
        this.router.navigate(['/login/enter-password']);
    }
}
