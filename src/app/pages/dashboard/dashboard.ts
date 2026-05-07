import { Component } from '@angular/core';
import { MelyGuidanceWidget } from './components/mely-guidance.widget';
import { MelyHalalStocksOverviewWidget } from './components/mely-halal-stocks-overview.widget';
import { MelyWealthHubWidget } from './components/mely-wealth-hub.widget';
import { MelyZakatWidget } from './components/mely-zakat.widget';
import { MelyHowItWorksWidget } from './components/mely-how-it-works.widget';
import { MelyScreeningActivityWidget } from './components/mely-screening-activity.widget';

@Component({
    selector: 'app-dashboard',
    imports: [
        MelyHalalStocksOverviewWidget,
        MelyWealthHubWidget,
        MelyZakatWidget,
        MelyScreeningActivityWidget,
        MelyGuidanceWidget,
        MelyHowItWorksWidget
    ],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-mely-halal-stocks-overview-widget class="contents" />
            <app-mely-wealth-hub-widget class="contents" />
            <app-mely-zakat-widget class="contents" />
            <app-mely-screening-activity-widget class="contents" />
            <app-mely-guidance-widget class="contents" />
            <app-mely-how-it-works-widget class="contents" />
        </div>
    `
})
export class Dashboard {}
