import { Component, OnInit, inject, computed } from '@angular/core';
import { ApiClient } from '../../services/api';
import { UserService } from '../../services/user';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-landing',
  templateUrl: './index.html'
})
export class Home implements OnInit {
  private api = inject(ApiClient);
  private userService = inject(UserService);
  private readonly defaultRepository = 'nekit/password-manager-backend';

  isLoggedIn = computed(() => this.userService.currentUser() !== null);

  platform = 'your device';
  downloadUrl = '';
  releasesUrl = '';

  async ngOnInit(): Promise<void> {
    if (!this.userService.currentUser()) {
      try {
        const user = await this.api.getMe();
        this.userService.setUser(user);
      } catch { /* not logged in */ }
    }

    const repository = this.resolveGithubRepository();
    this.releasesUrl = `https://github.com/${repository}/releases`;
    this.downloadUrl = this.releasesUrl;

    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes('android')) {
      this.platform = 'Android';
      this.downloadUrl = this.getLatestAssetUrl(repository, 'BlinkPass-android.apk');
    }

    else if (ua.includes('win')) {
      this.platform = 'Windows';
      this.downloadUrl = this.getLatestAssetUrl(repository, 'BlinkPass-windows.exe');
    }

    else if (ua.includes('mac')) {
      this.platform = 'macOS';
      this.downloadUrl = this.getLatestAssetUrl(repository, 'BlinkPass-macos.dmg');
    }

    else if (ua.includes('linux')) {
      this.platform = 'Linux';
      this.downloadUrl = this.getLatestAssetUrl(repository, 'BlinkPass-linux.AppImage');
    }
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
}
