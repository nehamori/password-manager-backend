import argon2 from 'argon2-browser/dist/argon2-bundled.min.js';


export class CryptoService {
    static async deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
        const result = await argon2.hash({
            pass: password,
            salt: salt,
            time: 3,
            mem: 65536,
            hashLen: 32,
            parallelism: 2,
            type: argon2.ArgonType.Argon2id,
        });
        return new Uint8Array(result.hash);
    }

    static hexToBytes(hex: string): Uint8Array {
        return new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    }

    static bytesToHex(bytes: Uint8Array): string {
        return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
    }

    static async hmacSHA256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
        const keyBytes = Uint8Array.from(key);
        const dataBytes = Uint8Array.from(data);

        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyBytes,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBytes);
        return new Uint8Array(signature);
    }
}