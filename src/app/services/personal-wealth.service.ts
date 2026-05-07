import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
    HawlStatusDto,
    MoneySummaryDto,
    PersonalBudgetDto,
    PersonalTransactionDto,
    SavingsGoalDto,
    SavingsSimulationResponseDto,
    ZakatAssetDto,
    ZakatAssetWrite,
    ZakatPortfolioCalculationDto
} from '../core/models/wealth.model';

@Injectable({ providedIn: 'root' })
export class PersonalWealthService {
    private readonly baseZakat = 'http://localhost:8090/api/v1/personal/zakat-portfolio';
    private readonly baseMoney = 'http://localhost:8090/api/v1/personal/money';

    constructor(private readonly http: HttpClient) {}

    listZakatAssets(): Observable<ZakatAssetDto[]> {
        return this.http.get<ZakatAssetDto[]>(`${this.baseZakat}/assets`);
    }

    addZakatAsset(body: ZakatAssetWrite): Observable<ZakatAssetDto> {
        return this.http.post<ZakatAssetDto>(`${this.baseZakat}/assets`, body);
    }

    updateZakatAsset(id: string, body: ZakatAssetWrite): Observable<ZakatAssetDto> {
        return this.http.put<ZakatAssetDto>(`${this.baseZakat}/assets/${id}`, body);
    }

    deleteZakatAsset(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseZakat}/assets/${id}`);
    }

    getHawl(): Observable<HawlStatusDto | null> {
        return this.http.get<HawlStatusDto>(`${this.baseZakat}/hawl`, { observe: 'response' }).pipe(
            map((r) => (r.status === 204 ? null : r.body ?? null))
        );
    }

    calculateZakatPortfolio(): Observable<ZakatPortfolioCalculationDto> {
        return this.http.post<ZakatPortfolioCalculationDto>(`${this.baseZakat}/calculate`, {}, { headers: { 'Content-Type': 'application/json' } });
    }

    enableZakatTracking(): Observable<void> {
        return this.http.post(`${this.baseZakat}/enable-tracking`, {}, { responseType: 'text' }).pipe(map(() => undefined));
    }

    listTransactions(from: string, to: string): Observable<PersonalTransactionDto[]> {
        const params = new HttpParams().set('from', from).set('to', to);
        return this.http.get<PersonalTransactionDto[]>(`${this.baseMoney}/transactions`, { params });
    }

    addTransaction(body: {
        occurredOn: string;
        direction: 'INCOME' | 'EXPENSE';
        categoryCode: string;
        amount: number;
        memo?: string | null;
    }): Observable<PersonalTransactionDto> {
        return this.http.post<PersonalTransactionDto>(`${this.baseMoney}/transactions`, body);
    }

    deleteTransaction(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseMoney}/transactions/${id}`);
    }

    listBudgets(yearMonth: string): Observable<PersonalBudgetDto[]> {
        const params = new HttpParams().set('yearMonth', yearMonth);
        return this.http.get<PersonalBudgetDto[]>(`${this.baseMoney}/budgets`, { params });
    }

    upsertBudget(body: { yearMonth: string; categoryCode: string; capAmount: number }): Observable<PersonalBudgetDto> {
        return this.http.post<PersonalBudgetDto>(`${this.baseMoney}/budgets`, body);
    }

    deleteBudget(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseMoney}/budgets/${id}`);
    }

    monthlySummary(yearMonth: string): Observable<MoneySummaryDto> {
        const params = new HttpParams().set('yearMonth', yearMonth);
        return this.http.get<MoneySummaryDto>(`${this.baseMoney}/summary`, { params });
    }

    listGoals(): Observable<SavingsGoalDto[]> {
        return this.http.get<SavingsGoalDto[]>(`${this.baseMoney}/goals`);
    }

    createGoal(body: { title: string; targetAmount: number; currentAmount: number; targetDate?: string | null }): Observable<SavingsGoalDto> {
        return this.http.post<SavingsGoalDto>(`${this.baseMoney}/goals`, body);
    }

    updateGoal(
        id: string,
        body: { title: string; targetAmount: number; currentAmount: number; targetDate?: string | null }
    ): Observable<SavingsGoalDto> {
        return this.http.put<SavingsGoalDto>(`${this.baseMoney}/goals/${id}`, body);
    }

    deleteGoal(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseMoney}/goals/${id}`);
    }

    simulateSavings(body: {
        initialBalance: number;
        monthlyContribution: number;
        months: number;
        annualProfitRatePercent: number;
    }): Observable<SavingsSimulationResponseDto> {
        return this.http.post<SavingsSimulationResponseDto>(`${this.baseMoney}/simulate`, body);
    }
}
