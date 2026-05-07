import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';

import { CurrencyConvertResponseDto } from '../../core/models/currency.model';
import { CurrencyApiService } from '../../services/currency-api.service';

@Component({
    selector: 'app-currency-converter-page',
    standalone: true,
    providers: [MessageService, DecimalPipe],
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        CardModule,
        ButtonModule,
        SelectModule,
        InputNumberModule,
        ToastModule,
        MessageModule,
        DividerModule,
        TooltipModule
    ],
    templateUrl: './currency-converter.page.html',
    styleUrl: './currency-converter.page.scss'
})
export class CurrencyConverterPage {
    private readonly currencyApi = inject(CurrencyApiService);
    private readonly messages = inject(MessageService);

    readonly currencyOptions = [
        { label: 'USD — US dollar', value: 'USD' },
        { label: 'EUR — Euro', value: 'EUR' },
        { label: 'GBP — British pound', value: 'GBP' },
        { label: 'TND — Tunisian dinar', value: 'TND' },
        { label: 'SAR — Saudi riyal', value: 'SAR' },
        { label: 'AED — UAE dirham', value: 'AED' },
        { label: 'CHF — Swiss franc', value: 'CHF' },
        { label: 'JPY — Japanese yen', value: 'JPY' },
        { label: 'CNY — Chinese yuan', value: 'CNY' },
        { label: 'TRY — Turkish lira', value: 'TRY' },
        { label: 'EGP — Egyptian pound', value: 'EGP' },
        { label: 'MAD — Moroccan dirham', value: 'MAD' },
        { label: 'CAD — Canadian dollar', value: 'CAD' },
        { label: 'AUD — Australian dollar', value: 'AUD' },
        { label: 'INR — Indian rupee', value: 'INR' },
        { label: 'PKR — Pakistani rupee', value: 'PKR' },
        { label: 'BDT — Bangladeshi taka', value: 'BDT' },
        { label: 'MYR — Malaysian ringgit', value: 'MYR' },
        { label: 'IDR — Indonesian rupiah', value: 'IDR' },
        { label: 'KWD — Kuwaiti dinar', value: 'KWD' },
        { label: 'QAR — Qatari riyal', value: 'QAR' },
        { label: 'ZAR — South African rand', value: 'ZAR' },
        { label: 'NGN — Nigerian naira', value: 'NGN' },
        { label: 'KES — Kenyan shilling', value: 'KES' }
    ];

    from = 'USD';
    to = 'TND';
    amount = 100;
    readonly loading = signal(false);
    readonly result = signal<CurrencyConvertResponseDto | null>(null);
    readonly configError = signal<string | null>(null);

    swap(): void {
        const a = this.from;
        this.from = this.to;
        this.to = a;
    }

    convert(): void {
        this.configError.set(null);
        this.loading.set(true);
        this.currencyApi
            .convert(this.from, this.to, this.amount)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (r) => {
                    this.result.set(r);
                    this.messages.add({ severity: 'success', summary: 'Converted', detail: `${r.amount} ${r.from} → ${r.result} ${r.to}` });
                },
                error: (err) => {
                    this.result.set(null);
                    const status = err?.status;
                    const msg =
                        err?.error?.message ?? err?.error?.detail ?? err?.message ?? 'Conversion failed.';
                    if (status === 501) {
                        this.configError.set(msg);
                        this.messages.add({ severity: 'warn', summary: 'Not configured', detail: msg });
                    } else if (status === 502 || status === 400) {
                        this.messages.add({ severity: 'error', summary: 'Conversion', detail: msg });
                    } else {
                        this.messages.add({ severity: 'error', summary: 'Conversion', detail: msg });
                    }
                }
            });
    }
}
