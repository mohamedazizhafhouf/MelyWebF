import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FinanceCoachChatHistory, FinanceCoachChatResponse, FinanceCoachInsights } from '../core/models/coach.model';

@Injectable({ providedIn: 'root' })
export class PersonalCoachService {
    private readonly baseUrl = 'http://localhost:8090/api/v1/personal/coach';

    constructor(private readonly http: HttpClient) {}

    monthlyInsights(yearMonth: string): Observable<FinanceCoachInsights> {
        const params = new HttpParams().set('yearMonth', yearMonth);
        return this.http.get<FinanceCoachInsights>(`${this.baseUrl}/monthly-insights`, { params });
    }

    chat(message: string, yearMonth: string): Observable<FinanceCoachChatResponse> {
        return this.http.post<FinanceCoachChatResponse>(`${this.baseUrl}/chat`, { message, yearMonth });
    }

    chatHistory(): Observable<FinanceCoachChatHistory> {
        return this.http.get<FinanceCoachChatHistory>(`${this.baseUrl}/chat`);
    }
}
