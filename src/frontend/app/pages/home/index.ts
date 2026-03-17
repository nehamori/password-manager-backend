import { Component, OnInit, computed, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiClient } from '../../services/api';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-landing',
  templateUrl: './index.html'
})
export class Home implements OnInit {
  private api = inject(ApiClient);
  private userService = inject(UserService);
  private readonly defaultRepository = 'nekit/password-manager-backend';
  private readonly iosInstallPromptDismissedKey = 'blinkpass.iosInstallPrompt.dismissed';

  isLoggedIn = computed(() => this.userService.currentUser() !== null);

  platform = 'your device';
  downloadUrl = '';
  releasesUrl = '';
  showIosInstallPrompt = false;

  async ngOnInit(): Promise<void> {
    if (!this.userService.currentUser()) {
      try {
        const user = await this.api.getMe();
        this.userService.setUser(user);
      } catch { /* not logged in */ }
    }

    const repository = this.resolveGithubRepository();
    this.releasesUrl = `https://github.com/${repository}/releases/latest`;
    this.downloadUrl = this.releasesUrl;
    this.showIosInstallPrompt = this.shouldShowIosInstallPrompt();

    const platform = this.detectPlatform();

    if (platform === 'android') {
      this.platform = 'Android';
      this.downloadUrl = this.getLatestAssetUrl(repository, 'BlinkPass-android.apk');
    }

    else if (platform === 'windows') {
      this.platform = 'Windows';
      this.downloadUrl = this.getLatestAssetUrl(repository, 'BlinkPass-windows.exe');
    }

    else if (platform === 'macos') {
      this.platform = 'macOS';
      this.downloadUrl = this.getLatestAssetUrl(repository, 'BlinkPass-macos.dmg');
    }

    else if (platform === 'linux') {
      this.platform = 'Linux';
      this.downloadUrl = this.getLatestAssetUrl(repository, 'BlinkPass-linux.AppImage');
    }
  }

  private detectPlatform(): 'android' | 'windows' | 'macos' | 'linux' | 'unknown' {
    const ua = navigator.userAgent.toLowerCase();
    const platform = (navigator.platform ?? '').toLowerCase();
    const uaDataPlatform = (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform?.toLowerCase() ?? '';

    if (ua.includes('android') || platform.includes('android') || uaDataPlatform.includes('android')) {
      return 'android';
    }

    if (ua.includes('windows') || platform.includes('win') || uaDataPlatform.includes('windows')) {
      return 'windows';
    }

    if (ua.includes('mac os') || ua.includes('macintosh') || platform.includes('mac') || uaDataPlatform.includes('mac')) {
      return 'macos';
    }

    // Some Android browsers strip the "android" token but keep Linux + mobile markers.
    const looksLikeMobileLinux = (ua.includes('linux') || platform.includes('linux') || uaDataPlatform.includes('linux'))
      && (ua.includes('mobile') || ua.includes('wv') || ua.includes('okhttp'));

    if (looksLikeMobileLinux) {
      return 'android';
    }

    if (ua.includes('linux') || platform.includes('linux') || uaDataPlatform.includes('linux')) {
      return 'linux';
    }

    return 'unknown';
  }

  private resolveGithubRepository(): string {
    const candidate = environment.githubRepository?.trim();

    if (!candidate || candidate === '__GITHUB_REPOSITORY__') {
      return this.defaultRepository;
    }

    return candidate;
  }

  private getLatestAssetUrl(repository: string, assetName: string): string {
    return `https://github.com/${repository}/releases/latest/download/${assetName}`;
  }

  dismissIosInstallPrompt(): void {
    this.showIosInstallPrompt = false;

    try {
      localStorage.setItem(this.iosInstallPromptDismissedKey, '1');
    } catch {
      // Ignore storage errors (private mode / storage restrictions).
    }
  }

  private shouldShowIosInstallPrompt(): boolean {
    if (!this.isIphoneSafari()) {
      return false;
    }

    if (this.isStandaloneMode()) {
      return false;
    }

    try {
      return localStorage.getItem(this.iosInstallPromptDismissedKey) !== '1';
    } catch {
      return true;
    }
  }

  private isIphoneSafari(): boolean {
    const ua = navigator.userAgent.toLowerCase();

    const isIphone = ua.includes('iphone');
    const isSafari = ua.includes('safari')
      && !ua.includes('crios')
      && !ua.includes('fxios')
      && !ua.includes('edgios')
      && !ua.includes('opios');

    return isIphone && isSafari;
  }

  private isStandaloneMode(): boolean {
    const iosNavigator = navigator as Navigator & { standalone?: boolean };

    return window.matchMedia('(display-mode: standalone)').matches || iosNavigator.standalone === true;
  }
}
