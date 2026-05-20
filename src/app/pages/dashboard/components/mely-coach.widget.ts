import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { FinanceCoachInsights } from '../../../core/models/coach.model';
import { PersonalCoachService } from '../../../services/personal-coach.service';

@Component({
    selector: 'app-mely-coach-widget',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, ProgressBarModule, TagModule],
    template: `
        <div class="col-span-12 xl:col-span-4">
            <div class="coach-card card h-full">
                <div class="coach-card__head">
                    <div>
                        <div class="eyebrow text-primary mb-2">AI Islamic finance coach</div>
                        <h2 class="text-xl font-semibold m-0">Mely Coach</h2>
                    </div>
                    <p-tag value="SAAS" severity="success" />
                </div>

                @if (insights(); as i) {
                    <div class="coach-score">
                        <strong>{{ i.healthScore }}</strong>
                        <span>/100</span>
                    </div>
                    <p-progressBar [value]="i.healthScore" [showValue]="false" styleClass="mb-4" />
                    <p class="text-muted-color leading-relaxed">{{ i.summary }}</p>
                    <div class="coach-mini-stack">
                        @for (card of i.cards.slice(0, 2); track card.title) {
                            <div class="coach-mini-row">
                                <span>{{ card.severity }}</span>
                                <strong>{{ card.title }}</strong>
                            </div>
                        }
                    </div>
                } @else {
                    <p class="text-muted-color leading-relaxed">Load your finance coach to see monthly guidance from budgets, goals, zakat, and halal investing history.</p>
                }

                <a pButton routerLink="/coach" label="Open coach" icon="pi pi-comments" iconPos="right" class="mt-4 w-full"></a>
            </div>
        </div>
    `,
    styles: `
        .coach-card {
            border-radius: 8px;
        }

        .coach-card__head {
            align-items: flex-start;
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .coach-score {
            align-items: baseline;
            display: flex;
            gap: 0.35rem;
            margin-bottom: 0.5rem;
        }

        .coach-score strong {
            font-size: 2.7rem;
            line-height: 1;
        }

        .coach-mini-stack {
            display: grid;
            gap: 0.5rem;
        }

        .coach-mini-row {
            border: 1px solid var(--surface-border);
            border-radius: 8px;
            display: grid;
            gap: 0.25rem;
            padding: 0.75rem;
        }

        .coach-mini-row span {
            color: var(--text-color-secondary);
            font-size: 0.72rem;
        }
    `
})
export class MelyCoachWidget implements OnInit {
    private readonly coachApi = inject(PersonalCoachService);
    readonly insights = signal<FinanceCoachInsights | null>(null);

    ngOnInit(): void {
        this.coachApi.monthlyInsights(this.currentYearMonth()).subscribe({
            next: (response) => this.insights.set(response),
            error: () => this.insights.set(null)
        });
    }

    private currentYearMonth(): string {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
}
