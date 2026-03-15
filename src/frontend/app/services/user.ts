import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    readonly currentUser = signal<User | null>(null);

    setUser(user: User): void {
        this.currentUser.set(user);
    }

    clear(): void {
        this.currentUser.set(null);
    }
}
