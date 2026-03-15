import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { environment } from '../environments/environment';
import { LoginFSM } from './services/login_fsm';

type BlinkpassElectronApi = {
  getLaunchProtocolUrl: () => Promise<string | null>;
  onProtocolUrl: (callback: (protocolUrl: string) => void) => (() => void) | void;
};

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('BlinkPassFront');

  constructor(private loginFsm: LoginFSM) { }

  async ngOnInit(): Promise<void> {
    if (!environment.isElectron) {
      return;
    }

    const electronApi = this.getElectronApi();
    if (!electronApi) {
      return;
    }

    electronApi.onProtocolUrl((protocolUrl) => {
      void this.handleProtocolUrl(protocolUrl);
    });

    const launchProtocolUrl = await electronApi.getLaunchProtocolUrl();
    if (launchProtocolUrl) {
      await this.handleProtocolUrl(launchProtocolUrl);
    }
  }

  private getElectronApi(): BlinkpassElectronApi | undefined {
    return (window as Window & { blinkpassElectron?: BlinkpassElectronApi }).blinkpassElectron;
  }

  private async handleProtocolUrl(protocolUrl: string): Promise<void> {
    const url = new URL(protocolUrl);
    const routeName = url.hostname || url.pathname.replace(/^\/+/, '');

    if (routeName !== 'login') {
      return;
    }

    const data = url.searchParams.get('data');
    if (!data) {
      return;
    }

    this.loginFsm.setupIsWebsiteLogin(true);
    await this.loginFsm.loginByBrowserData(data);
  }
}
