import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-mely-halal-stocks-overview-widget',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule],
    template: `
        <div class="col-span-12 xl:col-span-7">
            <div class="card overview-card h-full">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div class="max-w-2xl">
                        <div class="eyebrow mb-3">Mely Halal Investing</div>
                        <h2 class="text-3xl font-semibold mb-3">Screen stocks with transparent Sharia logic and investor-friendly purification guidance.</h2>
                        <p class="text-muted-color leading-relaxed mb-5">
                            Use Mely to review company activity, financial ratios, tatheer implications, and explanation-rich verdicts so users feel informed instead of excluded from the logic.
                        </p>
                        <div class="flex flex-wrap gap-3">
                            <a pButton routerLink="/halal-stocks/new" icon="pi pi-arrow-right" label="Start New Screening"></a>
                            <a pButton routerLink="/halal-stocks/history" icon="pi pi-clock" label="Open History" severity="secondary" [outlined]="true"></a>
                        </div>
                    </div>
                    <div class="insight-grid">
                        <div class="insight-pill">
                            <span>Manual mode</span>
                            <strong>Ready now</strong>
                        </div>
                        <div class="insight-pill">
                            <span>Screening</span>
                            <strong>Rules-based</strong>
                        </div>
                        <div class="insight-pill">
                            <span>Verdict logic</span>
                            <strong>Explainable</strong>
                        </div>
                        <div class="insight-pill">
                            <span>Tatheer</span>
                            <strong>Included</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: `
        .overview-card {
            background:
                radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 35%),
                linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(250, 250, 249, 0.96));
        }

        .eyebrow {
            color: #0f766e;
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }

        .insight-grid {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            min-width: 18rem;
        }

        .insight-pill {
            background: rgba(255, 255, 255, 0.88);
            border: 1px solid rgba(15, 118, 110, 0.14);
            border-radius: 1rem;
            padding: 1rem 1.1rem;
        }

        .insight-pill span {
            color: var(--text-color-secondary);
            display: block;
            font-size: 0.8rem;
            margin-bottom: 0.35rem;
            text-transform: uppercase;
        }

        .insight-pill strong {
            color: var(--text-color);
            font-size: 1rem;
        }
    `
})
export class MelyHalalStocksOverviewWidget {}
