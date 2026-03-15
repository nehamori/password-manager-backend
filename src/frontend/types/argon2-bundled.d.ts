declare module 'argon2-browser/dist/argon2-bundled.min.js' {
    export enum ArgonType {
        Argon2d = 0,
        Argon2i = 1,
        Argon2id = 2,
    }

    export type HashOptions = {
        pass: string | Uint8Array;
        salt: string | Uint8Array;
        time?: number;
        mem?: number;
        hashLen?: number;
        parallelism?: number;
        secret?: Uint8Array;
        ad?: Uint8Array;
        type?: ArgonType;
    };

    export type HashResult = {
        hash: Uint8Array;
        hashHex: string;
        encoded: string;
    };

    export type Argon2Module = {
        ArgonType: typeof ArgonType;
        hash(options: HashOptions): Promise<HashResult>;
    };

    const argon2: Argon2Module;
    export default argon2;
}
