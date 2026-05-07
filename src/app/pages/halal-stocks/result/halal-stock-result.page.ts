import { CommonModule, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import {
    LOCAL_STOCK_REQUEST_PREFIX,
    parseStoredStockScreening,
    stockScreeningLocalStorageKey
} from '../../../core/halal-stocks/stock-screening.client';
import {
    MetricUsedResponse,
    RuleResultResponse,
    StockScreeningResponse,
    StockVerdict
} from '../../../core/models/stock-screening.model';
import { StockScreeningService } from '../../../services/stock-screening.service';

@Component({
    selector: 'app-halal-stock-result-page',
    standalone: true,
    providers: [MessageService, DatePipe, CurrencyPipe, DecimalPipe],
    imports: [
        CommonModule,
        RouterModule,
        CardModule,
        ButtonModule,
        TagModule,
        ChipModule,
        DividerModule,
        ToastModule
    ],
    templateUrl: './halal-stock-result.page.html',
    styleUrl: './halal-stock-result.page.scss'
})
export class HalalStockResultPage implements OnInit, OnDestroy {
    error: string | null = null;
    result: StockScreeningResponse | null = null;

    private routeSubscription?: Subscription;
    private fetchSubscription?: Subscription;

    constructor(
        private stockScreeningService: StockScreeningService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private router: Router,
        private datePipe: DatePipe,
        private currencyPipe: CurrencyPipe,
        private decimalPipe: DecimalPipe
    ) {}

    ngOnInit() {
        this.routeSubscription = this.route.paramMap.subscribe((params) => {
            const requestId = params.get('requestId');
            if (!requestId) {
                this.router.navigate(['/halal-stocks/new']);
                return;
            }
            this.loadResult(requestId);
        });
    }

    ngOnDestroy() {
        this.routeSubscription?.unsubscribe();
        this.fetchSubscription?.unsubscribe();
    }

    get companyName(): string {
        return this.result?.companyName || 'Unknown Company';
    }

    get ticker(): string {
        return this.result?.ticker || '';
    }

    get verdict(): StockVerdict | null {
        return this.result?.verdict ?? null;
    }

    get verdictLabel(): string {
        switch (this.verdict) {
            case 'HALAL':
                return 'HALAL';
            case 'NON_HALAL':
                return 'NON-HALAL';
            case 'REVIEW_REQUIRED':
                return 'REVIEW REQUIRED';
            default:
                return 'PENDING';
        }
    }

    get verdictSeverity(): 'success' | 'danger' | 'warn' | 'info' | 'secondary' | 'contrast' | undefined {
        switch (this.verdict) {
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

    get explanation(): string | null {
        return this.result?.explanation ?? null;
    }

    get activitySummary(): string | null {
        return this.result?.activitySummary ?? null;
    }

    get ruleResults(): RuleResultResponse[] {
        return this.result?.ruleResults ?? [];
    }

    get metricsUsed(): { key: string; label: string; metric: MetricUsedResponse }[] {
        const metrics = this.result?.metricsUsed ?? {};
        return Object.entries(metrics).map(([key, metric]) => ({
            key,
            label: this.formatMetricLabel(key),
            metric
        }));
    }

    get needsTatheer(): boolean {
        return this.result?.needsTatheer ?? false;
    }

    get tatheerAmount(): number | null {
        return this.result?.tatheerAmount ?? null;
    }

    get purificationRatio(): number | null {
        return this.result?.purificationRatio ?? null;
    }

    get purificationPerShare(): number | null {
        return this.result?.purificationPerShare ?? null;
    }

    get warnings(): string[] {
        return this.result?.warnings ?? [];
    }

    get completedAt(): string | null {
        return this.result?.completedAt ?? null;
    }

    backToNew() {
        this.router.navigate(['/halal-stocks/new']);
    }

    viewHistory() {
        this.router.navigate(['/halal-stocks/history']);
    }

    formatValue(value: string | number | boolean | null | undefined): string {
        if (value === null || value === undefined) {
            return 'N/A';
        }
        if (typeof value === 'number') {
            return this.decimalPipe.transform(value, '1.2-6') ?? String(value);
        }
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        return value;
    }

    formatCurrency(value: number | null, currency: string = 'USD'): string {
        if (value === null || value === undefined) {
            return 'N/A';
        }
        return this.currencyPipe.transform(value, currency, 'symbol', '1.2-2') ?? String(value);
    }

    formatPercentage(value: number | null): string {
        if (value === null || value === undefined) {
            return 'N/A';
        }
        const formatted = this.decimalPipe.transform(value * 100, '1.2-2');
        return formatted ? formatted + '%' : 'N/A';
    }

    formatDate(dateStr: string | null): string {
        if (!dateStr) return 'N/A';
        return this.datePipe.transform(dateStr, 'medium') ?? dateStr;
    }

    private loadResult(requestId: string) {
        this.fetchSubscription?.unsubscribe();
        this.error = null;
        this.result = null;

        if (requestId.startsWith(LOCAL_STOCK_REQUEST_PREFIX)) {
            const raw = sessionStorage.getItem(stockScreeningLocalStorageKey(requestId));
            const parsed = raw ? parseStoredStockScreening(raw) : null;
            if (parsed && parsed.requestId === requestId) {
                this.applyResponse(parsed);
            } else {
                this.error =
                    'This local screening is no longer in browser storage (e.g. new tab or storage cleared). Run a new screening.';
            }
            return;
        }

        this.fetchSubscription = this.stockScreeningService.getScreeningResult(requestId).subscribe({
            next: (response) => {
                this.applyResponse(response);
            },
            error: () => {
                this.error = 'Failed to load the screening result.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: this.error
                });
            }
        });
    }

    private applyResponse(response: StockScreeningResponse) {
        this.result = response;

        if (response.status === 'COMPLETED') {
            if (response.verdict === null) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Incomplete',
                    detail: 'The screening could not determine a verdict.'
                });
            }
        } else if (response.status === 'FAILED') {
            this.error = response.warnings?.[0] ?? 'Screening failed.';
            this.messageService.add({
                severity: 'error',
                summary: 'Failed',
                detail: this.error
            });
        }
    }

    private formatMetricLabel(key: string): string {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (value) => value.toUpperCase())
            .trim();
    }
}
