type TelegramLoginData = {
    telegramBotName: string;
}

type DiscordLoginData = {
    clientId: string;
    redirectUri: string;
}

type DiscordLoginRequest = {
    code: string;
    redirectUri: string;
}

type User = {
    id: number;
    username: string;
    avatarUrl: string | null;
}

type LoginChallenge = {
    salt: string;
    challenge: string;
}

type LoginResponse = {
    user: User;
    loginChallenge: LoginChallenge;
    loginToken: string;
    isNewUser: boolean;
}

type LoginCompleteResponse = {
    user: User;
}