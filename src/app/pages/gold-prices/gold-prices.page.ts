import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { interval } from 'rxjs';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { LayoutService } from '@/app/layout/service/layout.service';
import { MetalHistoryChart, MetalsSpotBundle } from '../../core/models/metals.model';
import { MetalsApiService } from '../../services/metals-api.service';

@Component({
    selector: 'app-gold-prices-page',
    standalone: true,
    providers: [MessageService, DecimalPipe],
    imports: [CommonModule, FormsModule, RouterLink, CardModule, ChartModule, ButtonModule, SelectModule, ToastModule],
    templateUrl: './gold-prices.page.html',
    styleUrl: './gold-prices.page.scss'
})
export class GoldPricesPage implements OnInit {
    private readonly layoutService = inject(LayoutService);
    private readonly metalsApi = inject(MetalsApiService);
    private readonly messages = inject(MessageService);
    private readonly decimal = inject(DecimalPipe);
    private readonly destroyRef = inject(DestroyRef);

    selectedCurrency = 'USD';
    readonly historyDays = 10;

    readonly currencyOptions = [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
        { label: 'TND', value: 'TND' }
    ];

    readonly spot = signal<MetalsSpotBundle | null>(null);
    readonly history = signal<MetalHistoryChart | null>(null);
    readonly chartData = signal<unknown>(null);
    readonly chartOptions = signal<unknown>(null);
    readonly lastUpdated = signal<string | null>(null);
    readonly loadingChart = signal(true);

    constructor() {
        effect(() => {
            this.layoutService.layoutConfig().darkTheme;
            const h = this.history();
            if (h) {
                setTimeout(() => this.applyChartTheme(h), 0);
            }
        });
    }

    ngOnInit(): void {
        this.reloadAll();
        interval(90_000)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.refreshSpotOnly());
    }

    reloadAll(): void {
        const ccy = this.selectedCurrency;
        this.loadingChart.set(true);
        this.metalsApi.getHistoryChart(ccy, this.historyDays).subscribe({
            next: (h) => {
                this.history.set(h);
                this.loadingChart.set(false);
                setTimeout(() => this.applyChartTheme(h), 0);
            },
            error: (err) => {
                this.loadingChart.set(false);
                this.messages.add({
                    severity: 'error',
                    summary: 'History unavailable',
                    detail: err?.error?.message ?? 'Could not load chart data. Check API logs and GOLD_API_KEY (x-api-key) for history.'
                });
            }
        });
        this.refreshSpotOnly();
    }

    refreshSpotOnly(): void {
        this.metalsApi.getSpot(this.selectedCurrency).subscribe({
            next: (s) => {
                this.spot.set(s);
                this.lastUpdated.set(new Date().toLocaleTimeString());
            },
            error: (err) => {
                this.messages.add({
                    severity: 'warn',
                    summary: 'Spot prices',
                    detail: err?.error?.message ?? 'Live spot request failed.'
                });
            }
        });
    }

    onCurrencyChange(): void {
        this.reloadAll();
    }

    formatMoney(v: number | null | undefined, ccy: string): string {
        if (v == null) {
            return '—';
        }
        return this.decimal.transform(v, '1.2-2') ?? String(v);
    }

    formatTs(ts: number | null | undefined): string {
        if (ts == null) {
            return '';
        }
        try {
            return new Date(ts * 1000).toLocaleString();
        } catch {
            return String(ts);
        }
    }

    private applyChartTheme(h: MetalHistoryChart): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color') || '#1e293b';
        const textMuted = documentStyle.getPropertyValue('--text-color-secondary') || '#64748b';
        const goldLine = '#d4af37';
        const silverLine = '#94a3b8';

        this.chartData.set({
            labels: h.labels.map((d) => this.shortLabel(d)),
            datasets: [
                {
                    label: `Gold / g (${h.currency})`,
                    data: h.goldPricePerGram24k,
                    borderColor: goldLine,
                    backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (!chartArea) {
                            return 'rgba(212, 175, 55, 0.15)';
                        }
                        const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        g.addColorStop(0, 'rgba(212, 175, 55, 0.42)');
                        g.addColorStop(1, 'rgba(212, 175, 55, 0.02)');
                        return g;
                    },
                    fill: true,
                    tension: 0.42,
                    spanGaps: true,
                    borderWidth: 3,
                    pointRadius: 3,
                    pointHoverRadius: 7,
                    pointBackgroundColor: goldLine,
                    pointBorderColor: '#fff'
                },
                {
                    label: `Silver / g (${h.currency})`,
                    data: h.silverPricePerGram24k,
                    borderColor: silverLine,
                    backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (!chartArea) {
                            return 'rgba(148, 163, 184, 0.12)';
                        }
                        const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        g.addColorStop(0, 'rgba(148, 163, 184, 0.35)');
                        g.addColorStop(1, 'rgba(148, 163, 184, 0.02)');
                        return g;
                    },
                    fill: true,
                    tension: 0.42,
                    spanGaps: true,
                    borderWidth: 3,
                    pointRadius: 3,
                    pointHoverRadius: 7,
                    pointBackgroundColor: silverLine,
                    pointBorderColor: '#fff'
                }
            ]
        });

        this.chartOptions.set({
            maintainAspectRatio: false,
            responsive: true,
            animation: {
                duration: 1400,
                easing: 'easeOutQuart' as const
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        padding: 16
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.92)',
                    titleColor: '#f8fafc',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(212, 175, 55, 0.35)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 10
                }
            },
            scales: {
                x: {
                    ticks: { color: textMuted, maxRotation: 0 },
                    grid: { color: 'rgba(148, 163, 184, 0.15)' }
                },
                y: {
                    ticks: { color: textMuted },
                    grid: { color: 'rgba(148, 163, 184, 0.12)' }
                }
            }
        });
    }

    private shortLabel(isoDate: string): string {
        const p = isoDate.split('-');
        if (p.length === 3) {
            return `${p[1]}/${p[2]}`;
        }
        return isoDate;
    }
}
