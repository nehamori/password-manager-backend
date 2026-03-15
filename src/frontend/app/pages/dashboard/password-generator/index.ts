import { Component, signal } from '@angular/core';
import { NumberStepper } from '../../../components/number-stepper/index';

@Component({
    selector: 'app-dashboard-password-generator',
    imports: [NumberStepper],
    templateUrl: './index.html',
})
export class PasswordGeneratorPage {
    private readonly minLength = 8;
    private readonly maxLength = 64;

    readonly length = signal(16);
    readonly includeUppercase = signal(true);
    readonly includeLowercase = signal(true);
    readonly includeNumbers = signal(true);
    readonly includeSymbols = signal(true);
    readonly avoidAmbiguous = signal(false);
    readonly minNumbers = signal(1);
    readonly minSymbols = signal(1);
    readonly generatedPassword = signal('');
    readonly copyStatus = signal<'idle' | 'copied' | 'error'>('idle');

    constructor() {
        this.generatePassword();
    }

    onLengthChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.length.set(this.clampLength(Number(target.value)));
        this.normalizeConstraintTotals();
        this.generatePassword();
    }

    setLength(value: number): void {
        this.length.set(this.clampLength(value));
        this.normalizeConstraintTotals();
        this.generatePassword();
    }

    setIncludeUppercase(event: Event): void {
        this.includeUppercase.set((event.target as HTMLInputElement).checked);
        this.ensureAtLeastOneSetEnabled();
        this.normalizeConstraintTotals();
        this.generatePassword();
    }

    setIncludeLowercase(event: Event): void {
        this.includeLowercase.set((event.target as HTMLInputElement).checked);
        this.ensureAtLeastOneSetEnabled();
        this.normalizeConstraintTotals();
        this.generatePassword();
    }

    setIncludeNumbers(event: Event): void {
        this.includeNumbers.set((event.target as HTMLInputElement).checked);
        this.ensureAtLeastOneSetEnabled();
        this.normalizeConstraintTotals();
        this.generatePassword();
    }

    setIncludeSymbols(event: Event): void {
        this.includeSymbols.set((event.target as HTMLInputElement).checked);
        this.ensureAtLeastOneSetEnabled();
        this.normalizeConstraintTotals();
        this.generatePassword();
    }

    setAvoidAmbiguous(event: Event): void {
        this.avoidAmbiguous.set((event.target as HTMLInputElement).checked);
        this.generatePassword();
    }

    setMinNumbers(value: number): void {
        this.minNumbers.set(Math.max(0, value || 0));
        this.normalizeConstraintTotals();
        this.generatePassword();
    }

    setMinSymbols(value: number): void {
        this.minSymbols.set(Math.max(0, value || 0));
        this.normalizeConstraintTotals();
        this.generatePassword();
    }

    generatePassword(): void {
        const lower = this.filterCharset('abcdefghijklmnopqrstuvwxyz');
        const upper = this.filterCharset('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        const numbers = this.filterCharset('0123456789');
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        const requiredSets: string[] = [];

        if (this.includeLowercase() && lower) requiredSets.push(lower);
        if (this.includeUppercase() && upper) requiredSets.push(upper);

        const requiredNumberCount = this.includeNumbers() && numbers
            ? Math.max(1, this.minNumbers())
            : 0;
        const requiredSymbolCount = this.includeSymbols()
            ? Math.max(1, this.minSymbols())
            : 0;

        const optionalSets: string[] = [];
        if (this.includeLowercase() && lower) optionalSets.push(lower);
        if (this.includeUppercase() && upper) optionalSets.push(upper);
        if (requiredNumberCount > 0 && numbers) optionalSets.push(numbers);
        if (requiredSymbolCount > 0) optionalSets.push(symbols);

        if (!optionalSets.length) {
            this.generatedPassword.set('');
            return;
        }

        const allChars = optionalSets.join('');
        const password: string[] = [];

        for (const charset of requiredSets) {
            password.push(this.pickOne(charset));
        }

        for (let index = 0; index < requiredNumberCount; index++) {
            password.push(this.pickOne(numbers));
        }

        for (let index = 0; index < requiredSymbolCount; index++) {
            password.push(this.pickOne(symbols));
        }

        while (password.length < this.length()) {
            password.push(this.pickOne(allChars));
        }

        this.generatedPassword.set(this.shuffle(password).join(''));
        this.copyStatus.set('idle');
    }

    async copyPassword(): Promise<void> {
        const value = this.generatedPassword();
        if (!value) return;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(value);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = value;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            this.copyStatus.set('copied');
        } catch {
            this.copyStatus.set('error');
        }
    }

    private ensureAtLeastOneSetEnabled(): void {
        if (
            this.includeLowercase() ||
            this.includeUppercase() ||
            this.includeNumbers() ||
            this.includeSymbols()
        ) {
            return;
        }

        this.includeLowercase.set(true);
    }

    private normalizeConstraintTotals(): void {
        if (!this.includeNumbers()) {
            this.minNumbers.set(0);
        }

        if (!this.includeSymbols()) {
            this.minSymbols.set(0);
        }

        const lowerUpperRequired =
            (this.includeLowercase() ? 1 : 0) +
            (this.includeUppercase() ? 1 : 0);

        let remainingCapacity = this.length() - lowerUpperRequired;
        if (remainingCapacity < 0) {
            remainingCapacity = 0;
        }

        if (this.includeNumbers()) {
            const normalized = Math.max(1, this.minNumbers());
            this.minNumbers.set(Math.min(normalized, remainingCapacity));
        }

        remainingCapacity -= this.includeNumbers() ? this.minNumbers() : 0;
        if (remainingCapacity < 0) {
            remainingCapacity = 0;
        }

        if (this.includeSymbols()) {
            const normalized = Math.max(1, this.minSymbols());
            this.minSymbols.set(Math.min(normalized, remainingCapacity));
        }
    }

    private filterCharset(charset: string): string {
        if (!this.avoidAmbiguous()) {
            return charset;
        }

        return charset.replace(/[O0oIl1]/g, '');
    }

    private clampLength(value: number): number {
        if (!Number.isFinite(value)) {
            return this.minLength;
        }

        return Math.min(this.maxLength, Math.max(this.minLength, Math.trunc(value)));
    }

    private pickOne(charset: string): string {
        return charset[this.randomInt(charset.length)];
    }

    private shuffle(items: string[]): string[] {
        const result = [...items];

        for (let index = result.length - 1; index > 0; index--) {
            const swapIndex = this.randomInt(index + 1);
            [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
        }

        return result;
    }

    private randomInt(maxExclusive: number): number {
        const random = new Uint32Array(1);
        crypto.getRandomValues(random);
        return random[0] % maxExclusive;
    }
}
