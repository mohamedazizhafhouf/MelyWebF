import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { exhaustMap, Observable, takeWhile, timer } from 'rxjs';
import {
    StockExplanationResponse,
    StockHistoryFilters,
    StockScreeningFormValue,
    StockScreeningHistoryResponse,
    StockScreeningResponse
} from '../core/models/stock-screening.model';

@Injectable({
    providedIn: 'root'
})
export class StockScreeningService {
    private readonly apiUrl = 'http://localhost:8090/api/v1/stocks/check';

    constructor(private http: HttpClient) {}

    submitScreening(formValue: StockScreeningFormValue): Observable<StockScreeningResponse> {
        return this.http.post<StockScreeningResponse>(this.apiUrl, this.buildJsonPayload(formValue));
    }

    getScreeningResult(requestId: string): Observable<StockScreeningResponse> {
        return this.http.get<StockScreeningResponse>(`${this.apiUrl}/${requestId}`);
    }

    getExplanation(requestId: string): Observable<StockExplanationResponse> {
        return this.http.get<StockExplanationResponse>(`${this.apiUrl}/${requestId}/explanation`);
    }

    getHistory(filters: StockHistoryFilters): Observable<StockScreeningHistoryResponse> {
        let params = new HttpParams()
            .set('page', String(filters.page ?? 0))
            .set('size', String(filters.size ?? 10));

        if (filters.status) {
            params = params.set('status', filters.status);
        }
        if (filters.verdict) {
            params = params.set('verdict', filters.verdict);
        }
        if (filters.query?.trim()) {
            params = params.set('query', filters.query.trim());
        }

        return this.http.get<StockScreeningHistoryResponse>(`${this.apiUrl}/history`, { params });
    }

    /**
     * Polls until status is no longer SUBMITTED/PROCESSING.
     * Uses timer(0, 1500) for an immediate first fetch and exhaustMap so overlapping
     * ticks do not cancel an in-flight GET (switchMap caused stuck loading on slow responses).
     */
    pollUntilFinished(requestId: string): Observable<StockScreeningResponse> {
        return timer(0, 1500).pipe(
            exhaustMap(() => this.getScreeningResult(requestId)),
            takeWhile((response) => response.status === 'PROCESSING' || response.status === 'SUBMITTED', true)
        );
    }

    private buildJsonPayload(formValue: StockScreeningFormValue): Record<string, unknown> {
        const body: Record<string, unknown> = {
            companyName: formValue.companyName?.trim(),
            ticker: formValue.ticker?.trim() || undefined,
            countryOrMarket: formValue.countryOrMarket?.trim(),
            currency: formValue.currency?.trim(),
            businessDescription: formValue.businessDescription?.trim(),
            sector: formValue.sector?.trim() || undefined,
            fiscalYear: formValue.fiscalYear?.trim() || undefined,
            reportingPeriod: formValue.reportingPeriod?.trim() || undefined
        };

        this.putNumber(body, 'interestBearingDebt', formValue.interestBearingDebt);
        this.putNumber(body, 'cashAndInterestBearingAssets', formValue.cashAndInterestBearingAssets);
        this.putNumber(body, 'totalAssetsOrMarketCap', formValue.totalAssetsOrMarketCap);
        this.putNumber(body, 'totalRevenue', formValue.totalRevenue);
        this.putNumber(body, 'nonCompliantIncome', formValue.nonCompliantIncome);
        this.putNumber(body, 'sharesOwned', formValue.sharesOwned);
        this.putNumber(body, 'investedAmount', formValue.investedAmount);

        return body;
    }

    private putNumber(target: Record<string, unknown>, key: string, value: number | null) {
        if (value !== null && value !== undefined) {
            target[key] = value;
        }
    }
}
