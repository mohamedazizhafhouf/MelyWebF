import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';

@Component({
    selector: 'app-mely-how-it-works-widget',
    standalone: true,
    imports: [CommonModule, TimelineModule],
    template: `
        <div class="col-span-12 lg:col-span-6 xl:col-span-8">
            <div class="card h-full">
                <div class="font-semibold text-xl mb-3">How Mely screens a stock</div>
                <p class="text-muted-color mb-5">This walkthrough helps the user and the jury understand that the screening output is structured, explainable, and ready for future automation.</p>
                <p-timeline [value]="steps">
                    <ng-template #marker let-step>
                        <span class="timeline-dot" [style.background]="step.color">
                            <i [class]="step.icon"></i>
                        </span>
                    </ng-template>
                    <ng-template #content let-step>
                        <div class="step-card">
                            <div class="font-medium mb-1">{{ step.title }}</div>
                            <small class="text-muted-color">{{ step.description }}</small>
                        </div>
                    </ng-template>
                </p-timeline>
            </div>
        </div>
    `,
    styles: `
        .timeline-dot {
            align-items: center;
            border-radius: 999px;
            color: white;
            display: inline-flex;
            height: 2rem;
            justify-content: center;
            width: 2rem;
        }

        .step-card {
            border: 1px solid var(--surface-border);
            border-radius: 0.95rem;
            padding: 0.95rem 1rem;
        }
    `
})
export class MelyHowItWorksWidget {
    steps = [
        {
            title: '1. Company context',
            description: 'The user submits company details such as market, sector, and activity description.',
            icon: 'pi pi-building',
            color: '#0f766e'
        },
        {
            title: '2. Ratio inputs',
            description: 'The backend applies the financial metrics needed for Islamic ratio checks.',
            icon: 'pi pi-chart-line',
            color: '#0891b2'
        },
        {
            title: '3. Verdict and tatheer',
            description: 'The system returns halal status, purification guidance, and a rule-by-rule explanation.',
            icon: 'pi pi-check-circle',
            color: '#f59e0b'
        }
    ];
}
