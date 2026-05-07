import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';

import {
    HawlStatusDto,
    MoneySummaryDto,
    PersonalBudgetDto,
    PersonalTransactionDto,
    SavingsGoalDto,
    SavingsSimulationResponseDto,
    ZakatAssetDto,
    ZakatAssetType,
    ZakatAssetWrite,
    ZakatPortfolioCalculationDto
} from '../../core/models/wealth.model';
import { PersonalWealthService } from '../../services/personal-wealth.service';

type WealthTab = 'overview' | 'zakat' | 'cashflow' | 'budgets' | 'goals' | 'simulator';

@Component({
    selector: 'app-wealth-hub',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        CardModule,
        ButtonModule,
        TableModule,
        TagModule,
        ToastModule,
        InputNumberModule,
        InputTextModule,
        SelectModule,
        ProgressBarModule,
        ChartModule,
        DialogModule,
        DividerModule,
        TooltipModule
    ],
    providers: [MessageService],
    templateUrl: './wealth-hub.page.html',
    styleUrl: './wealth-hub.page.scss'
})
export class WealthHubPage implements OnInit {
    private readonly wealthApi = inject(PersonalWealthService);
    private readonly messages = inject(MessageService);

    readonly tabs: { id: WealthTab; label: string; icon: string; blurb: string }[] = [
        { id: 'overview', label: 'Overview', icon: 'pi pi-compass', blurb: 'Net flow & pulse' },
        { id: 'zakat', label: 'Zakat portfolio', icon: 'pi pi-wallet', blurb: 'Tracked niṣāb assets' },
        { id: 'cashflow', label: 'Cash flow', icon: 'pi pi-list', blurb: 'Income & spending' },
        { id: 'budgets', label: 'Budgets', icon: 'pi pi-chart-bar', blurb: 'Caps by category' },
        { id: 'goals', label: 'Savings goals', icon: 'pi pi-flag', blurb: 'Targets you define' },
        { id: 'simulator', label: 'Simulator', icon: 'pi pi-bolt', blurb: 'Profit-rate scenarios' }
    ];

    readonly activeTab = signal<WealthTab>('overview');
    readonly busy = signal(false);
    readonly yearMonth = signal(this.currentYearMonth());

    readonly summary = signal<MoneySummaryDto | null>(null);
    readonly zakatAssets = signal<ZakatAssetDto[]>([]);
    readonly hawl = signal<HawlStatusDto | null>(null);
    readonly zakatCalc = signal<ZakatPortfolioCalculationDto | null>(null);
    readonly transactions = signal<PersonalTransactionDto[]>([]);
    readonly budgets = signal<PersonalBudgetDto[]>([]);
    readonly goals = signal<SavingsGoalDto[]>([]);
    readonly simResult = signal<SavingsSimulationResponseDto | null>(null);

    readonly txDirectionOptions = [
        { label: 'Expense', value: 'EXPENSE' as const },
        { label: 'Income', value: 'INCOME' as const }
    ];

    readonly categoryOptions = [
        { label: 'Housing', value: 'HOUSING' },
        { label: 'Food', value: 'FOOD' },
        { label: 'Charity', value: 'CHARITY' },
        { label: 'Transport', value: 'TRANSPORT' },
        { label: 'Family', value: 'FAMILY' },
        { label: 'Savings', value: 'SAVINGS' },
        { label: 'Education', value: 'EDUCATION' },
        { label: 'Other', value: 'OTHER' }
    ];

    readonly assetTypeOptions: { label: string; value: ZakatAssetType }[] = [
        { label: 'Cash', value: 'CASH' },
        { label: 'Gold', value: 'GOLD' },
        { label: 'Silver', value: 'SILVER' },
        { label: 'Savings account', value: 'SAVINGS_ACCOUNT' },
        { label: 'Current account', value: 'CURRENT_ACCOUNT' },
        { label: 'Stocks', value: 'INVESTMENT_STOCKS' },
        { label: 'Mutual funds', value: 'INVESTMENT_MUTUAL_FUNDS' },
        { label: 'Real estate', value: 'INVESTMENT_REAL_ESTATE' },
        { label: 'Crypto', value: 'CRYPTO_CURRENCY' },
        { label: 'Retirement', value: 'RETIREMENT_FUNDS' },
        { label: 'Other', value: 'OTHER_ASSETS' }
    ];

    txForm = {
        occurredOn: new Date().toISOString().slice(0, 10),
        direction: 'EXPENSE' as 'INCOME' | 'EXPENSE',
        categoryCode: 'HOUSING',
        amount: 0,
        memo: ''
    };

    budgetForm = { categoryCode: 'FOOD', capAmount: 0 };

    goalForm = { title: '', targetAmount: 0, currentAmount: 0, targetDate: '' as string | null };

    simForm = { initialBalance: 0, monthlyContribution: 500, months: 36, annualProfitRatePercent: 4 };

    assetDialog = false;
    assetEditId: string | null = null;
    assetForm: ZakatAssetWrite = {
        assetType: 'SAVINGS_ACCOUNT',
        amount: 0,
        value: 0,
        currencyCode: 'USD',
        description: '',
        weight: null,
        purity: null,
        annualReturnRate: null
    };

    readonly expenseChartData = computed(() => {
        const s = this.summary();
        if (!s?.expenseByCategory?.length) {
            return {
                labels: [] as string[],
                datasets: [{ data: [] as number[], backgroundColor: [] as string[], borderWidth: 0 }]
            };
        }
        const palette = ['#6366f1', '#22d3ee', '#f472b6', '#fbbf24', '#34d399', '#a78bfa', '#fb7185', '#94a3b8'];
        return {
            labels: s.expenseByCategory.map((c) => c.categoryCode),
            datasets: [
                {
                    data: s.expenseByCategory.map((c) => Number(c.spent)),
                    backgroundColor: s.expenseByCategory.map((_, i) => palette[i % palette.length]),
                    borderWidth: 0
                }
            ]
        };
    });

    readonly expenseChartOptions = {
        plugins: { legend: { display: false } },
        cutout: '62%',
        maintainAspectRatio: false
    };

    readonly simChartData = computed(() => {
        const r = this.simResult();
        if (!r?.points?.length) {
            return { labels: [] as string[], datasets: [{ label: 'Balance', data: [] as number[], tension: 0.35 }] };
        }
        return {
            labels: r.points.map((p) => (p.monthIndex === 0 ? 'Start' : `M${p.monthIndex}`)),
            datasets: [
                {
                    label: 'Projected balance',
                    data: r.points.map((p) => Number(p.balance)),
                    fill: true,
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    tension: 0.35,
                    pointRadius: 0
                }
            ]
        };
    });

    readonly simChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { maxTicksLimit: 8 } },
            y: { ticks: { callback: (v: string | number) => `${v}` } }
        }
    };

    ngOnInit(): void {
        this.refreshAll();
    }

    setTab(tab: WealthTab): void {
        this.activeTab.set(tab);
        if (tab === 'cashflow') {
            this.loadTransactions();
        }
        if (tab === 'budgets') {
            this.loadBudgets();
        }
        if (tab === 'goals') {
            this.loadGoals();
        }
    }

    refreshAll(): void {
        this.busy.set(true);
        this.loadSummary();
        this.loadZakatBundle();
        this.loadTransactions();
        this.loadBudgets();
        this.loadGoals();
        this.wealthApi
            .getHawl()
            .pipe(finalize(() => this.busy.set(false)))
            .subscribe({
                next: (h) => this.hawl.set(h),
                error: () => this.messages.add({ severity: 'warn', summary: 'Ḥawl', detail: 'Could not load lunar-year tracker.' })
            });
    }

    loadSummary(): void {
        this.wealthApi.monthlySummary(this.yearMonth()).subscribe({
            next: (s) => this.summary.set(s),
            error: () => this.messages.add({ severity: 'error', summary: 'Summary', detail: 'Failed to load monthly summary.' })
        });
    }

    loadZakatBundle(): void {
        this.wealthApi.listZakatAssets().subscribe({
            next: (a) => this.zakatAssets.set(a),
            error: () => this.zakatAssets.set([])
        });
    }

    loadTransactions(): void {
        const ym = this.yearMonth();
        const [y, m] = ym.split('-').map(Number);
        const from = `${ym}-01`;
        const last = new Date(y, m, 0).getDate();
        const to = `${ym}-${String(last).padStart(2, '0')}`;
        this.wealthApi.listTransactions(from, to).subscribe({
            next: (t) => this.transactions.set(t),
            error: () => this.transactions.set([])
        });
    }

    loadBudgets(): void {
        this.wealthApi.listBudgets(this.yearMonth()).subscribe({
            next: (b) => this.budgets.set(b),
            error: () => this.budgets.set([])
        });
    }

    loadGoals(): void {
        this.wealthApi.listGoals().subscribe({
            next: (g) => this.goals.set(g),
            error: () => this.goals.set([])
        });
    }

    onYearMonthChange(): void {
        this.loadSummary();
        this.loadTransactions();
        this.loadBudgets();
    }

    runPortfolioZakat(): void {
        this.busy.set(true);
        this.wealthApi
            .calculateZakatPortfolio()
            .pipe(finalize(() => this.busy.set(false)))
            .subscribe({
                next: (c) => {
                    this.zakatCalc.set(c);
                    this.messages.add({ severity: 'success', summary: 'Zakat snapshot', detail: c.message ?? 'Updated.' });
                    this.loadZakatBundle();
                    this.loadSummary();
                },
                error: (e) => {
                    const msg = e?.error?.message ?? 'Enable tracking or add assets first.';
                    this.messages.add({ severity: 'warn', summary: 'Zakat', detail: msg });
                }
            });
    }

    enableZakatTracking(): void {
        this.wealthApi.enableZakatTracking().subscribe({
            next: () => {
                this.messages.add({ severity: 'success', summary: 'Zakat tracking', detail: 'Enabled for your account.' });
                this.refreshAll();
            },
            error: () => this.messages.add({ severity: 'error', summary: 'Zakat', detail: 'Could not enable tracking.' })
        });
    }

    openNewAsset(): void {
        this.assetEditId = null;
        this.assetForm = {
            assetType: 'SAVINGS_ACCOUNT',
            amount: 0,
            value: 0,
            currencyCode: 'USD',
            description: '',
            weight: null,
            purity: null,
            annualReturnRate: null
        };
        this.assetDialog = true;
    }

    editAsset(row: ZakatAssetDto): void {
        this.assetEditId = row.id;
        this.assetForm = {
            assetType: row.assetType,
            amount: Number(row.amount),
            value: Number(row.value),
            currencyCode: row.currencyCode ?? 'USD',
            description: row.description ?? '',
            weight: row.weight != null ? Number(row.weight) : null,
            purity: row.purity != null ? Number(row.purity) : null,
            annualReturnRate: row.annualReturnRate != null ? Number(row.annualReturnRate) : null
        };
        this.assetDialog = true;
    }

    saveAsset(): void {
        const body = { ...this.assetForm };
        const req = this.assetEditId
            ? this.wealthApi.updateZakatAsset(this.assetEditId, body)
            : this.wealthApi.addZakatAsset(body);
        req.subscribe({
            next: () => {
                this.assetDialog = false;
                this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Zakat-tracked asset updated.' });
                this.loadZakatBundle();
            },
            error: () => this.messages.add({ severity: 'error', summary: 'Asset', detail: 'Save failed.' })
        });
    }

    removeAsset(row: ZakatAssetDto): void {
        this.wealthApi.deleteZakatAsset(row.id).subscribe({
            next: () => {
                this.messages.add({ severity: 'info', summary: 'Removed', detail: 'Asset archived from portfolio.' });
                this.loadZakatBundle();
            },
            error: () => this.messages.add({ severity: 'error', summary: 'Asset', detail: 'Delete failed.' })
        });
    }

    addTx(): void {
        this.wealthApi
            .addTransaction({
                occurredOn: this.txForm.occurredOn,
                direction: this.txForm.direction,
                categoryCode: this.txForm.categoryCode,
                amount: this.txForm.amount,
                memo: this.txForm.memo || null
            })
            .subscribe({
                next: () => {
                    this.messages.add({ severity: 'success', summary: 'Recorded', detail: 'Transaction saved.' });
                    this.loadTransactions();
                    this.loadSummary();
                },
                error: () => this.messages.add({ severity: 'error', summary: 'Transaction', detail: 'Could not save.' })
            });
    }

    removeTx(row: PersonalTransactionDto): void {
        this.wealthApi.deleteTransaction(row.id).subscribe({
            next: () => {
                this.loadTransactions();
                this.loadSummary();
            },
            error: () => this.messages.add({ severity: 'error', summary: 'Transaction', detail: 'Delete failed.' })
        });
    }

    addBudget(): void {
        this.wealthApi
            .upsertBudget({
                yearMonth: this.yearMonth(),
                categoryCode: this.budgetForm.categoryCode,
                capAmount: this.budgetForm.capAmount
            })
            .subscribe({
                next: () => {
                    this.messages.add({ severity: 'success', summary: 'Budget', detail: 'Cap saved for category.' });
                    this.loadBudgets();
                    this.loadSummary();
                },
                error: () => this.messages.add({ severity: 'error', summary: 'Budget', detail: 'Save failed.' })
            });
    }

    removeBudget(row: PersonalBudgetDto): void {
        this.wealthApi.deleteBudget(row.id).subscribe({
            next: () => {
                this.loadBudgets();
                this.loadSummary();
            },
            error: () => this.messages.add({ severity: 'error', summary: 'Budget', detail: 'Delete failed.' })
        });
    }

    deleteGoal(g: SavingsGoalDto): void {
        this.wealthApi.deleteGoal(g.id).subscribe({
            next: () => this.loadGoals(),
            error: () => this.messages.add({ severity: 'error', summary: 'Goal', detail: 'Delete failed.' })
        });
    }

    addGoal(): void {
        this.wealthApi
            .createGoal({
                title: this.goalForm.title,
                targetAmount: this.goalForm.targetAmount,
                currentAmount: this.goalForm.currentAmount,
                targetDate: this.goalForm.targetDate || null
            })
            .subscribe({
                next: () => {
                    this.goalForm = { title: '', targetAmount: 0, currentAmount: 0, targetDate: null };
                    this.messages.add({ severity: 'success', summary: 'Goal', detail: 'Savings goal created.' });
                    this.loadGoals();
                },
                error: () => this.messages.add({ severity: 'error', summary: 'Goal', detail: 'Could not create goal.' })
            });
    }

    runSim(): void {
        this.wealthApi
            .simulateSavings({
                initialBalance: this.simForm.initialBalance,
                monthlyContribution: this.simForm.monthlyContribution,
                months: this.simForm.months,
                annualProfitRatePercent: this.simForm.annualProfitRatePercent
            })
            .subscribe({
                next: (r) => {
                    this.simResult.set(r);
                    this.messages.add({ severity: 'info', summary: 'Simulation', detail: 'Projection refreshed (educational).' });
                },
                error: () => this.messages.add({ severity: 'error', summary: 'Simulator', detail: 'Request failed.' })
            });
    }

    goalProgress(g: SavingsGoalDto): number {
        const t = Number(g.targetAmount);
        const c = Number(g.currentAmount);
        if (!t || t <= 0) {
            return 0;
        }
        return Math.min(100, Math.round((c / t) * 100));
    }

    num(v: string | null | undefined): number {
        if (v == null || v === '') {
            return 0;
        }
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    }

    formatInt(n: number): string {
        return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
    }

    private currentYearMonth(): string {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
}
