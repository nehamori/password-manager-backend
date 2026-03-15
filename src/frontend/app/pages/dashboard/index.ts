import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DashboardNav } from '../../components/dashboard-nav';
import { ApiClient } from '../../services/api';
import { UserService } from '../../services/user';

@Component({
    selector: 'app-dashboard',
    imports: [RouterOutlet, DashboardNav],
    templateUrl: './index.html',
})
export class Dashboard implements OnInit {
    constructor(
        private api: ApiClient,
        private userService: UserService,
        private router: Router,
    ) { }

    async ngOnInit(): Promise<void> {
        if (this.userService.currentUser()) return;

        try {
            const user = await this.api.getMe();
            this.userService.setUser(user);
        } catch {
            this.router.navigate(['/login']);
        }
    }
}
