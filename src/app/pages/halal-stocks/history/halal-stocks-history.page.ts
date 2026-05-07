import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import {
    StockExplanationResponse,
    StockHistoryFilters,
    StockScreeningHistoryItemResponse,
    StockScreeningHistoryResponse,
    StockScreeningResponse,
    StockVerdict
} from '../../../core/models/stock-screening.model';
import { StockScreeningService } from '../../../services/stock-screening.service';

@Component({
    selector: 'app-halal-stocks-history-page',
    standalone: true,
    providers: [MessageService, DatePipe],
    imports: [CommonModule, FormsModule, RouterModule, TableModule, ButtonModule, TagModule, DialogModule, InputTextModule, SelectModule, ToastModule, IconFieldModule, InputIconModule],
    templateUrl: './halal-stocks-history.page.html',
    styleUrl: './halal-stocks-history.page.scss'
})
export class HalalStocksHistoryPage implements OnInit {
    detailVisible = false;
    selectedResult: StockScreeningResponse | null = null;
    selectedExplanation: StockExplanationResponse | null = null;
    history = signal<StockScreeningHistoryResponse | null>(null);

    filters: StockHistoryFilters = {
        page: 0,
        size: 10,
        status: '',
        verdict: '',
        query: ''
    };

    readonly statusOptions = [
        { label: 'All statuses', value: '' },
        { label: 'Submitted', value: 'SUBMITTED' },
        { label: 'Processing', value: 'PROCESSING' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Failed', value: 'FAILED' }
    ];

    readonly verdictOptions = [
        { label: 'All verdicts', value: '' },
        { label: 'Halal', value: 'HALAL' },
        { label: 'Non-Halal', value: 'NON_HALAL' },
        { label: 'Review Required', value: 'REVIEW_REQUIRED' }
    ];

    constructor(
        private stockScreeningService: StockScreeningService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadHistory();

        this.route.paramMap.subscribe((params) => {
            const requestId = params.get('requestId');
            if (requestId) {
                this.openDetails(requestId);
            }
        });
    }

    loadHistory(page = this.filters.page ?? 0) {
        this.filters.page = page;

        this.stockScreeningService.getHistory(this.filters).subscribe({
            next: (response) => {
                this.history.set(response);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'History unavailable',
                    detail: error?.error?.message ?? 'We could not load your screening history.'
                });
            }
        });
    }

    applyFilters() {
        this.loadHistory(0);
    }

    onPageChange(event: { first?: number; rows?: number }) {
        const nextPage = Math.floor((event.first ?? 0) / (event.rows ?? (this.filters.size ?? 10)));
        this.filters.size = event.rows ?? this.filters.size ?? 10;
        this.loadHistory(nextPage);
    }

    openDetails(requestId: string) {
        this.detailVisible = true;
        this.selectedResult = null;
        this.selectedExplanation = null;

        this.stockScreeningService.getScreeningResult(requestId).subscribe({
            next: (result) => {
                this.selectedResult = result;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Result unavailable',
                    detail: 'We could not load the detailed screening result.'
                });
            }
        });

        this.stockScreeningService.getExplanation(requestId).subscribe({
            next: (explanation) => {
                this.selectedExplanation = explanation;
            },
            error: () => {}
        });
    }

    formatScreeningMode(mode: string) {
        return mode === 'AUTOMATIC_LLM' ? 'Legacy' : 'Manual';
    }

    openFullResult(requestId: string) {
        this.router.navigate(['/halal-stocks/result', requestId]);
    }

    verdictSeverity(verdict: StockVerdict | null) {
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

    rowStatusSeverity(status: string) {
        switch (status) {
            case 'COMPLETED':
                return 'success';
            case 'FAILED':
                return 'danger';
            case 'PROCESSING':
                return 'warn';
            default:
                return 'info';
        }
    }

    get rows() {
        return this.history()?.content ?? [];
    }

    get totalRecords() {
        return this.history()?.totalElements ?? 0;
    }

    get firstRecord() {
        return (this.filters.page ?? 0) * (this.filters.size ?? 10);
    }
}
