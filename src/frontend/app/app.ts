import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Capacitor, registerPlugin } from '@capacitor/core';

import { environment } from '../environments/environment';
import { LoginFSM } from './services/login_fsm';

type BlinkpassElectronApi = {
  getLaunchProtocolUrl: () => Promise<string | null>;
  onProtocolUrl: (callback: (protocolUrl: string) => void) => (() => void) | void;
};

type CapacitorAppPlugin = {
  addListener: (
    eventName: 'appUrlOpen',
    listener: (event: { url?: string }) => void
  ) => Promise<{ remove: () => Promise<void> }> | { remove: () => Promise<void> };
  getLaunchUrl: () => Promise<{ url?: string }>;
};

const CapacitorAppPlugin = registerPlugin<CapacitorAppPlugin>('App');

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('BlinkPassFront');

  constructor(private loginFsm: LoginFSM) { }

  async ngOnInit(): Promise<void> {
    const isNativePlatform = Capacitor.isNativePlatform();

    console.log('[blinkpass][deeplink] ngOnInit', {
      isElectron: environment.isElectron,
      isNativePlatform,
      isAppPluginAvailable: Capacitor.isPluginAvailable('App'),
    });

    const capacitorPlugins = (window as Window & { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor?.Plugins;
    console.log('[blinkpass][deeplink] capacitor plugins', {
      pluginNames: capacitorPlugins ? Object.keys(capacitorPlugins) : [],
    });

    if (environment.isElectron && !isNativePlatform) {
      console.log('[blinkpass][deeplink] setup electron handling');
      await this.setupElectronProtocolHandling();
    }

    if (isNativePlatform) {
      console.log('[blinkpass][deeplink] setup native handling');
      await this.setupNativeProtocolHandling();
    }
  }

  private async setupElectronProtocolHandling(): Promise<void> {
    console.log('[blinkpass][deeplink][electron] init');

    const electronApi = this.getElectronApi();
    if (!electronApi) {
      console.warn('[blinkpass][deeplink][electron] API not found on window');
      return;
    }

    electronApi.onProtocolUrl((protocolUrl) => {
      console.log('[blinkpass][deeplink][electron] onProtocolUrl event', { protocolUrl });
      void this.handleProtocolUrl(protocolUrl);
    });

    const launchProtocolUrl = await electronApi.getLaunchProtocolUrl();
    console.log('[blinkpass][deeplink][electron] launch protocol url', { launchProtocolUrl });

    if (launchProtocolUrl) {
      await this.handleProtocolUrl(launchProtocolUrl);
    }
  }

  private async setupNativeProtocolHandling(): Promise<void> {
    console.log('[blinkpass][deeplink][native] init');

    if (!Capacitor.isPluginAvailable('App')) {
      console.warn('[blinkpass][deeplink][native] Capacitor App plugin not available');
      return;
    }

    try {
      await CapacitorAppPlugin.addListener('appUrlOpen', ({ url }) => {
        console.log('[blinkpass][deeplink][native] appUrlOpen event', { url });

        if (!url) {
          console.warn('[blinkpass][deeplink][native] appUrlOpen without url');
          return;
        }

        void this.handleProtocolUrl(url);
      });

      const launchUrl = await CapacitorAppPlugin.getLaunchUrl();
      console.log('[blinkpass][deeplink][native] launch url', { launchUrl });

      if (launchUrl?.url) {
        await this.handleProtocolUrl(launchUrl.url);
      }
    } catch (error) {
      console.error('[blinkpass][deeplink][native] failed to initialize handling', error);
    }
  }

  private getElectronApi(): BlinkpassElectronApi | undefined {
    return (window as Window & { blinkpassElectron?: BlinkpassElectronApi }).blinkpassElectron;
  }

  private async handleProtocolUrl(protocolUrl: string): Promise<void> {
    console.log('[blinkpass][deeplink] handleProtocolUrl called', { protocolUrl });

    let url: URL;

    try {
      url = new URL(protocolUrl);
    } catch (error) {
      console.error('[blinkpass][deeplink] invalid URL', { protocolUrl, error });
      return;
    }

    const routeName = url.hostname || url.pathname.replace(/^\/+/, '');
    console.log('[blinkpass][deeplink] parsed URL', {
      href: url.href,
      protocol: url.protocol,
      hostname: url.hostname,
      pathname: url.pathname,
      search: url.search,
      routeName,
    });

    if (routeName !== 'login') {
      console.warn('[blinkpass][deeplink] ignored route', { routeName });
      return;
    }

    const data = url.searchParams.get('data');
    if (!data) {
      console.warn('[blinkpass][deeplink] missing data param', { href: url.href });
      return;
    }

    console.log('[blinkpass][deeplink] login data received', { dataLength: data.length });

    this.loginFsm.setupIsWebsiteLogin(true);
    console.log('[blinkpass][deeplink] setupIsWebsiteLogin(true) done');

    await this.loginFsm.loginByBrowserData(data);
    console.log('[blinkpass][deeplink] loginByBrowserData finished');
  }
}
