import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { DiscordWidget, TelegramWidget } from "../../components/login";
import { Register } from './register/register';
import { SignIn } from './signin/signin';

@Component({
  selector: 'app-login',
  imports: [CommonModule, Register, SignIn, TelegramWidget, DiscordWidget],
  templateUrl: './index.html',
})
export class Login {
  mode: 'login' | 'register' = 'login';

  showLogin() {
    this.mode = 'login';
  }

  showRegister() {
    this.mode = 'register';
  }
}
