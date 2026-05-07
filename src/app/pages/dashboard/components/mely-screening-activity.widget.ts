import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { StockScreeningHistoryItemResponse, StockVerdict } from '../../../core/models/stock-screening.model';
import { StockScreeningService } from '../../../services/stock-screening.service';

@Component({
    selector: 'app-mely-screening-activity-widget',
    standalone: true,
    imports: [CommonModule, RouterModule, TagModule, ButtonModule, DatePipe],
    template: `
        <div class="col-span-12 xl:col-span-5">
            <div class="card h-full">
                <div class="flex items-start justify-between gap-4 mb-5">
                    <div>
                        <div class="font-semibold text-xl mb-2">Recent screenings</div>
                        <p class="text-muted-color mb-0">See the latest verdicts and jump back into the detailed explanation when needed.</p>
                    </div>
                    <a pButton routerLink="/halal-stocks/history" icon="pi pi-external-link" severity="secondary" [text]="true" label="All history"></a>
                </div>

                @if (items() === null) {
                } @else if (items()!.length === 0) {
                    <div class="empty-state">No screenings yet. Run your first halal stock check to start building history.</div>
                } @else {
                    <div class="screening-stack">
                        @for (item of items()!; track item.requestId) {
                            <a class="screening-row" [routerLink]="['/halal-stocks/history', item.requestId]">
                                <div>
                                    <div class="font-medium">{{ item.companyName }}</div>
                                    <small class="text-muted-color">{{ item.createdAt | date: 'mediumDate' }}</small>
                                </div>
                                <div class="flex items-center gap-2 flex-wrap justify-end">
                                    <p-tag [severity]="statusSeverity(item.verdict)" [value]="item.verdict || item.status"></p-tag>
                                </div>
                            </a>
                        }
                    </div>
                }
            </div>
        </div>
    `,
    styles: `
        .screening-stack {
            display: grid;
            gap: 0.85rem;
        }

        .screening-row {
            align-items: center;
            border: 1px solid var(--surface-border);
            border-radius: 1rem;
            color: inherit;
            display: flex;
            justify-content: space-between;
            padding: 0.95rem 1rem;
            text-decoration: none;
            transition: transform 0.16s ease, border-color 0.16s ease;
        }

        .screening-row:hover {
            border-color: rgba(15, 118, 110, 0.35);
            transform: translateY(-1px);
        }

        .empty-state {
            border: 1px dashed var(--surface-border);
            border-radius: 1rem;
            color: var(--text-color-secondary);
            padding: 1.2rem;
            text-align: center;
        }
    `
})
export class MelyScreeningActivityWidget implements OnInit {
    /** `null` until the first history response (avoids a false “empty” flash). */
    items = signal<StockScreeningHistoryItemResponse[] | null>(null);

    constructor(private stockScreeningService: StockScreeningService) {}

    ngOnInit() {
        this.stockScreeningService.getHistory({ page: 0, size: 5 }).subscribe({
            next: (response) => {
                this.items.set(response.content);
            },
            error: () => {
                this.items.set([]);
            }
        });
    }

    statusSeverity(verdict: StockVerdict | null) {
        switch (verdict) {
            case 'HALAL':
                return 'success';
            case 'NON_HALAL':
                return 'danger';
            case 'REVIEW_REQUIRED':
                return 'warn';
            default:
                return 'info';
        }
    }
}
