import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Workspace',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
                    { label: 'New Screening', icon: 'pi pi-fw pi-chart-line', routerLink: ['/halal-stocks/new'] },
                    { label: 'Screening History', icon: 'pi pi-fw pi-history', routerLink: ['/halal-stocks/history'] },
                    { label: 'Zakat calculator', icon: 'pi pi-fw pi-calculator', routerLink: ['/zakat'] },
                    { label: 'Wealth hub', icon: 'pi pi-fw pi-wallet', routerLink: ['/wealth'] },
                    { label: 'Currency converter', icon: 'pi pi-fw pi-dollar', routerLink: ['/currency'] },
                    { label: 'Gold & silver spot', icon: 'pi pi-fw pi-chart-line', routerLink: ['/gold-prices'] }
                ]
            },
            {
                label: 'Halal Investing',
                items: [
                    { label: 'New Screening', icon: 'pi pi-fw pi-chart-line', routerLink: ['/halal-stocks/new'] },
                    { label: 'History', icon: 'pi pi-fw pi-clock', routerLink: ['/halal-stocks/history'] },
                    { label: 'How Screening Works', icon: 'pi pi-fw pi-sparkles', routerLink: ['/'] }
                ]
            },
            {
                label: 'Support',
                items: [
                    { label: 'Documentation', icon: 'pi pi-fw pi-book', routerLink: ['/documentation'] }
                ]
            }
        ];
    }
}
