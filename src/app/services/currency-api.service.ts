import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CurrencyConvertResponseDto } from '../core/models/currency.model';

@Injectable({ providedIn: 'root' })
export class CurrencyApiService {
    private readonly baseUrl = 'http://localhost:8090/api/v1/currency';

    constructor(private readonly http: HttpClient) {}

    convert(from: string, to: string, amount: number): Observable<CurrencyConvertResponseDto> {
        const params = new HttpParams().set('from', from).set('to', to).set('amount', String(amount));
        return this.http.get<CurrencyConvertResponseDto>(`${this.baseUrl}/convert`, { params });
    }
}
