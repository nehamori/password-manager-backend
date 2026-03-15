import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientEncryption } from '../../../services/client-encryption';

@Component({
    selector: 'app-login-enter-password',
    imports: [FormsModule],
    templateUrl: './index.html',
})
export class EnterPassword implements OnInit {
    password = signal('');
    isLoading = signal(false);
    error = signal<string | null>(null);

    constructor(
        readonly clientEncryption: ClientEncryption,
        private router: Router,
    ) { }

    ngOnInit() {
        if (!this.clientEncryption.pendingLogin()) {
            this.router.navigate(['/login']);
        }
    }

    async submit() {
        if (!this.password() || this.isLoading()) return;

        this.isLoading.set(true);
        this.error.set(null);

        try {
            await this.clientEncryption.completeLogin(this.password());
            this.router.navigate(['/']);
        } catch (e) {
            this.error.set(e instanceof Error ? e.message : 'Failed to complete login. Please try again.');
        } finally {
            this.isLoading.set(false);
        }
    }
}
