import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-number-stepper',
    standalone: true,
    templateUrl: './index.html',
})
export class NumberStepper {
    @Input({ required: true }) value!: number;
    @Input() min = 0;
    @Input() max = Number.MAX_SAFE_INTEGER;
    @Input() step = 1;
    @Input() disabled = false;

    @Output() valueChange = new EventEmitter<number>();

    decrement(): void {
        if (this.disabled) {
            return;
        }

        this.valueChange.emit(this.clamp(this.value - this.step));
    }

    increment(): void {
        if (this.disabled) {
            return;
        }

        this.valueChange.emit(this.clamp(this.value + this.step));
    }

    onInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        const nextValue = Number(target.value);
        this.valueChange.emit(this.clamp(nextValue));
    }

    private clamp(value: number): number {
        if (!Number.isFinite(value)) {
            return this.min;
        }

        const normalized = Math.trunc(value);
        return Math.min(this.max, Math.max(this.min, normalized));
    }
}
