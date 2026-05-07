import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ZakatCalculationRequest, ZakatCalculationResult, ZakatDefaults } from '../core/models/zakat.model';

@Injectable({
    providedIn: 'root'
})
export class ZakatService {
    private readonly baseUrl = 'http://localhost:8090/api/v1/zakat';

    constructor(private http: HttpClient) {}

    getDefaults(): Observable<ZakatDefaults> {
        return this.http.get<ZakatDefaults>(`${this.baseUrl}/defaults`);
    }

    calculate(payload: ZakatCalculationRequest): Observable<ZakatCalculationResult> {
        return this.http.post<ZakatCalculationResult>(`${this.baseUrl}/calculate`, payload);
    }
}
