import { Component, OnInit, inject, computed } from '@angular/core';
import { ApiClient } from '../../services/api';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-landing',
  templateUrl: './index.html'
})
export class Home implements OnInit {
  private api = inject(ApiClient);
  private userService = inject(UserService);

  isLoggedIn = computed(() => this.userService.currentUser() !== null);

  platform = 'your device';
  downloadUrl = '#';

  async ngOnInit(): Promise<void> {
    if (!this.userService.currentUser()) {
      try {
        const user = await this.api.getMe();
        this.userService.setUser(user);
      } catch { /* not logged in */ }
    }
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes('android')) {
      this.platform = 'Android';
      this.downloadUrl = '/downloads/blinkpass-android.apk';
    }

    else if (ua.includes('win')) {
      this.platform = 'Windows';
      this.downloadUrl = '/downloads/blinkpass-win.exe';
    }

    else if (ua.includes('mac')) {
      this.platform = 'macOS';
      this.downloadUrl = '/downloads/blinkpass-mac.dmg';
    }

    else if (ua.includes('linux')) {
      this.platform = 'Linux';
      this.downloadUrl = '/downloads/blinkpass-linux.AppImage';
    }
  }
}
