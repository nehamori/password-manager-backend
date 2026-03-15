import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './index.html'
})
export class Home implements OnInit {
  platform = 'your device';
  downloadUrl = '#';

  ngOnInit(): void {
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes('win')) {
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
