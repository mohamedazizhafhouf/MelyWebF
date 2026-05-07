import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { StepperModule } from 'primeng/stepper';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { RuleResultResponse, StockScreeningFormValue, StockVerdict, MetricUsedResponse } from '../../../core/models/stock-screening.model';
import {
    computeLocalStockScreening,
    stockScreeningLocalStorageKey
} from '../../../core/halal-stocks/stock-screening.client';

@Component({
    selector: 'app-halal-stocks-screening-page',
    standalone: true,
    providers: [MessageService],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        AvatarModule,
        StepperModule,
        CardModule,
        ChipModule,
        InputTextModule,
        TextareaModule,
        InputNumberModule,
        ButtonModule,
        TagModule,
        TimelineModule,
        ToastModule,
        DividerModule
    ],
    templateUrl: './halal-stocks-screening.page.html',
    styleUrl: './halal-stocks-screening.page.scss'
})
export class HalalStocksScreeningPage implements OnDestroy {
    activeStep = 1;
    private routeSubscription?: Subscription;

    form: StockScreeningFormValue = {
        companyName: '',
        ticker: '',
        countryOrMarket: '',
        currency: 'USD',
        businessDescription: '',
        sector: '',
        fiscalYear: '',
        reportingPeriod: '',
        interestBearingDebt: null,
        cashAndInterestBearingAssets: null,
        totalAssetsOrMarketCap: null,
        totalRevenue: null,
        nonCompliantIncome: null,
        sharesOwned: null,
        investedAmount: null,
        documents: []
    };

    readonly workflowTimeline = [
        { label: 'Enter company details', icon: 'pi pi-building', helper: 'Company name, sector, and market' },
        { label: 'Input financial ratios', icon: 'pi pi-calculator', helper: 'Debt, cash, revenue, non-compliant income' },
        { label: 'Review and submit', icon: 'pi pi-check', helper: 'Confirm inputs, then view the full verdict page' }
    ];

    readonly companyIdentityFields = [
        { label: 'Company Name', value: () => this.form.companyName, required: true },
        { label: 'Ticker', value: () => this.form.ticker },
        { label: 'Country / Market', value: () => this.form.countryOrMarket, required: true },
        { label: 'Currency', value: () => this.form.currency, required: true },
        { label: 'Sector', value: () => this.form.sector },
        { label: 'Fiscal Year', value: () => this.form.fiscalYear },
        { label: 'Reporting Period', value: () => this.form.reportingPeriod }
    ];

    readonly coreFinancialFields = [
        { key: 'interestBearingDebt', label: 'Interest-Bearing Debt' },
        { key: 'cashAndInterestBearingAssets', label: 'Cash and Interest-Bearing Assets' },
        { key: 'totalAssetsOrMarketCap', label: 'Total Assets or Market Cap' },
        { key: 'totalRevenue', label: 'Total Revenue' },
        { key: 'nonCompliantIncome', label: 'Non-Compliant Income' }
    ] as const;

    readonly personalizationFields = [
        { key: 'sharesOwned', label: 'Shares Owned' },
        { key: 'investedAmount', label: 'Invested Amount' }
    ] as const;

    constructor(
        private messageService: MessageService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.routeSubscription = this.route.queryParamMap.subscribe((params) => {
            const seededCompanyName = params.get('companyName');
            if (seededCompanyName && !this.form.companyName) {
                this.form.companyName = seededCompanyName;
            }
        });
    }

    nextStep() {
        if (this.activeStep === 1 && !this.isCompanyStepValid()) {
            this.showWarn('Complete the company profile before continuing.');
            return;
        }

        if (this.activeStep === 2 && !this.hasRequiredManualMetrics()) {
            this.showWarn('Please provide the five core financial inputs so the manual screening logic can run.');
            return;
        }

        this.activeStep = Math.min(this.activeStep + 1, 3);
    }

    previousStep() {
        this.activeStep = Math.max(this.activeStep - 1, 1);
    }

    submitManualScreening() {
        if (!this.isCompanyStepValid() || !this.hasRequiredManualMetrics()) {
            this.showWarn('Please complete the required company and financial fields before submitting.');
            return;
        }

        try {
            const response = computeLocalStockScreening(this.form);
            try {
                sessionStorage.setItem(stockScreeningLocalStorageKey(response.requestId), JSON.stringify(response));
            } catch {
                // quota or private mode — still navigate; result page may not survive refresh
            }
            this.router.navigate(['/halal-stocks/result', response.requestId]);
        } catch (e) {
            this.messageService.add({
                severity: 'error',
                summary: 'Screening failed',
                detail: e instanceof Error ? e.message : 'Unable to run screening.'
            });
        }
    }

    openHistory() {
        this.router.navigate(['/halal-stocks/history']);
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

    ruleSeverity(rule: RuleResultResponse) {
        if (rule.passed === true) {
            return 'success';
        }
        if (rule.passed === false) {
            return 'danger';
        }
        return 'warn';
    }

    get companyReviewEntries() {
        return this.companyIdentityFields.map((field) => ({
            label: field.label,
            value: this.formatValue(field.value()),
            required: Boolean(field.required)
        }));
    }

    get businessDescriptionReview() {
        return this.form.businessDescription.trim() || 'Not provided';
    }

    get coreFinancialReviewEntries() {
        return this.coreFinancialFields.map((field) => ({
            label: field.label,
            value: this.formatValue(this.form[field.key])
        }));
    }

    get personalizationReviewEntries() {
        return this.personalizationFields.map((field) => ({
            label: field.label,
            value: this.formatValue(this.form[field.key])
        }));
    }

    get manualReviewCards() {
        return [
            { label: 'Company', value: this.form.companyName || 'Not set' },
            { label: 'Core ratio inputs', value: this.hasRequiredManualMetrics() ? 'Complete' : 'Incomplete' },
            { label: 'Tatheer personalization', value: this.hasPersonalizationInputs() ? 'Included' : 'Not included' },
            { label: 'Mode', value: 'Manual (rules engine)' }
        ];
    }

    ngOnDestroy() {
        this.routeSubscription?.unsubscribe();
    }

    formatValue(value: string | number | boolean | null | undefined) {
        if (value === null || value === undefined) {
            return 'Not provided';
        }

        if (typeof value === 'number') {
            return new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(value);
        }

        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        const normalized = value.trim();
        return normalized ? normalized : 'Not provided';
    }

    formatMetricLabel(key: string) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (value) => value.toUpperCase())
            .trim();
    }

    formatMetricSource(source: string | null) {
        if (!source) {
            return 'Unknown source';
        }

        switch (source.toLowerCase()) {
            case 'manual':
                return 'Manual input';
            case 'extracted':
                return 'Document extraction';
            default:
                return source;
        }
    }

    metricSourceSeverity(source: string | null) {
        switch (source?.toLowerCase()) {
            case 'manual':
                return 'success';
            case 'extracted':
                return 'info';
            default:
                return 'secondary';
        }
    }

    hasMetricTrace(metric: MetricUsedResponse) {
        return Boolean(metric.sourceDocument || metric.pageNumber || metric.snippet);
    }

    private isCompanyStepValid() {
        return Boolean(
            this.form.companyName.trim() &&
                this.form.countryOrMarket.trim() &&
                this.form.currency.trim() &&
                this.form.businessDescription.trim()
        );
    }

    private hasRequiredManualMetrics() {
        return (
            this.form.interestBearingDebt !== null &&
            this.form.cashAndInterestBearingAssets !== null &&
            this.form.totalAssetsOrMarketCap !== null &&
            this.form.totalRevenue !== null &&
            this.form.nonCompliantIncome !== null
        );
    }

    private hasPersonalizationInputs() {
        return this.form.sharesOwned !== null || this.form.investedAmount !== null;
    }

    private showWarn(detail: string) {
        this.messageService.add({ severity: 'warn', summary: 'Check the flow', detail });
    }
}
