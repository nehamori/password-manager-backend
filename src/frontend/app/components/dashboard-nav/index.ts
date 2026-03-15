import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../services/user';

@Component({
    selector: 'app-dashboard-nav',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './index.html',
})
export class DashboardNav {
    private readonly userService = inject(UserService);
    protected readonly user = this.userService.currentUser;

    protected readonly userInitial = computed(() => {
        const username = this.user()?.username;
        return username ? username[0].toUpperCase() : '?';
    });
}
