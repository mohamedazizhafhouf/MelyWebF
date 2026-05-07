import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ZAKAT_BUILTIN_DEFAULTS, computeZakatClient } from '../../core/zakat/zakat-calculator.client';
import { ZakatCalculationRequest, ZakatCalculationResult, ZakatDefaults } from '../../core/models/zakat.model';

@Component({
    selector: 'app-zakat-calculator-page',
    standalone: true,
    providers: [MessageService],
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        InputNumberModule,
        CheckboxModule,
        DividerModule,
        MessageModule,
        TagModule,
        TableModule,
        ToastModule
    ],
    templateUrl: './zakat-calculator.page.html',
    styleUrl: './zakat-calculator.page.scss'
})
export class ZakatCalculatorPage {
    /** Same numbers as the API defaults; calculation runs locally for instant results. */
    readonly defaults: ZakatDefaults = { ...ZAKAT_BUILTIN_DEFAULTS };

    result: ZakatCalculationResult | null = null;

    cash: number | null = null;
    bankSavings: number | null = null;
    receivables: number | null = null;
    tradeGoods: number | null = null;
    investmentsZakatable: number | null = null;
    otherAssets: number | null = null;
    debts: number | null = null;
    goldGrams: number | null = null;
    silverGrams: number | null = null;
    goldPricePerGram: number | null = null;
    silverPricePerGram: number | null = null;
    hawlAcknowledged = false;

    constructor(private messages: MessageService) {}

    applyDefaultMetalPrices(): void {
        this.goldPricePerGram = this.defaults.defaultGoldPricePerGram;
        this.silverPricePerGram = this.defaults.defaultSilverPricePerGram;
    }

    clearPriceOverrides(): void {
        this.goldPricePerGram = null;
        this.silverPricePerGram = null;
    }

    calculate(): void {
        try {
            this.result = computeZakatClient(this.buildRequest(), this.defaults);
        } catch (e) {
            this.result = null;
            const msg = e instanceof Error ? e.message : 'Calculation failed.';
            this.messages.add({ severity: 'error', summary: 'Cannot calculate', detail: msg });
        }
    }

    private buildRequest(): ZakatCalculationRequest {
        const req: ZakatCalculationRequest = {
            cash: this.cash ?? 0,
            bankSavings: this.bankSavings ?? 0,
            receivables: this.receivables ?? 0,
            tradeGoods: this.tradeGoods ?? 0,
            investmentsZakatable: this.investmentsZakatable ?? 0,
            otherAssets: this.otherAssets ?? 0,
            debts: this.debts ?? 0,
            goldGrams: this.goldGrams ?? 0,
            silverGrams: this.silverGrams ?? 0,
            hawlAcknowledged: this.hawlAcknowledged
        };
        if (this.goldPricePerGram != null && this.goldPricePerGram > 0) {
            req.goldPricePerGram = this.goldPricePerGram;
        }
        if (this.silverPricePerGram != null && this.silverPricePerGram > 0) {
            req.silverPricePerGram = this.silverPricePerGram;
        }
        return req;
    }
}
