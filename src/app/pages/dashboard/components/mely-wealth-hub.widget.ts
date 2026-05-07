import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-mely-wealth-hub-widget',
    standalone: true,
    imports: [RouterModule, ButtonModule],
    template: `
        <div class="col-span-12 lg:col-span-6">
            <div class="wealth-teaser card h-full">
                <div class="wealth-teaser__shine" aria-hidden="true"></div>
                <div class="relative z-1 flex flex-col gap-4">
                    <div>
                        <div class="eyebrow mb-2 text-primary">New · Personal CFO</div>
                        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-0 m-0">Wealth hub</h2>
                        <p class="text-muted-color leading-relaxed m-0 max-w-3xl">
                            Zakatable portfolio, monthly cash flow, budgets, savings goals, and a halāl profit-rate simulator —
                            designed like a premium fintech surface with Islamic guardrails in the copy.
                        </p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <a pButton routerLink="/wealth" label="Open wealth hub" icon="pi pi-arrow-right" iconPos="right" [rounded]="true"></a>
                        <a pButton routerLink="/zakat" label="Zakat estimator" class="p-button-outlined" [rounded]="true"></a>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: `
        .wealth-teaser {
            position: relative;
            overflow: hidden;
            border-radius: 1.25rem;
            border: 1px solid var(--surface-border);
            padding: 1.75rem;
            background: linear-gradient(125deg, var(--surface-card), color-mix(in srgb, var(--primary-color) 6%, var(--surface-card)));
            box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        }
        .wealth-teaser__shine {
            position: absolute;
            inset: -30% auto auto -10%;
            width: 55%;
            height: 140%;
            background: radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.25), transparent 60%);
            filter: blur(8px);
            pointer-events: none;
        }
        .z-1 {
            z-index: 1;
        }
    `
})
export class MelyWealthHubWidget {}
