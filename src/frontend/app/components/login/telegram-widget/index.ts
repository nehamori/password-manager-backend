import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TELEGRAM_BOT_NAME } from '../../../app.config';

@Component({
    selector: 'app-telegram-widget',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './index.html',
})
export class TelegramWidget implements OnInit, AfterViewInit, OnDestroy {
    @Output() auth = new EventEmitter<any>();

    @ViewChild('container', { static: true })
    private container!: ElementRef<HTMLElement>;

    ngOnInit() {
        (window as any).onTelegramAuth = (user: any) => this.auth.emit(user);
    }

    ngAfterViewInit() {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://telegram.org/js/telegram-widget.js?23';
        script.setAttribute('data-telegram-login', TELEGRAM_BOT_NAME);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');
        this.container.nativeElement.appendChild(script);
    }

    ngOnDestroy() {
        // clean up global handler
        delete (window as any).onTelegramAuth;
    }
}
