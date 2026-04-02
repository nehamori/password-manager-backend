// Auth Types
export type TelegramLoginData = {
    telegramBotName: string;
}

export type DiscordLoginData = {
    clientId: string;
    redirectUri: string;
}

export type DiscordLoginRequest = {
    code: string;
    redirectUri: string;
}

export type User = {
    id: number;
    username: string;
    avatarUrl: string | null;
}

export type LoginChallenge = {
    salt: string;
    challenge: string;
}

export type LoginResponse = {
    user: User;
    loginChallenge: LoginChallenge;
    loginToken: string;
    isNewUser: boolean;
}

export type LoginCompleteResponse = {
    user: User;
}

// Data Types Enums
export enum FieldType {
    TEXT = 'TEXT',
    PASSWORD = 'PASSWORD',
    EMAIL = 'EMAIL',
    TOTP = 'TOTP',
    NOTES = 'NOTES',
}

// Data Types Interfaces
export interface DataTypeField {
    name: string;
    type: FieldType;
}

export interface DataTypeFieldResponse {
    id: number;
    name: string;
    type: FieldType;
}

export interface DataTypeCreateRequest {
    title: string;
    fields?: DataTypeField[];
}

export interface DataTypeUpdateRequest {
    title?: string;
}

export interface DataTypeResponse {
    id: number;
    title: string;
    fields: DataTypeFieldResponse[];
}

export interface DataTypeListResponse {
    id: number;
    title: string;
    fieldCount: number;
}