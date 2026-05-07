import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MetalHistoryChart, MetalsSpotBundle } from '../core/models/metals.model';

@Injectable({
    providedIn: 'root'
})
export class MetalsApiService {
    private readonly baseUrl = 'http://localhost:8090/api/v1/metals';

    constructor(private http: HttpClient) {}

    getSpot(currency: string = 'USD'): Observable<MetalsSpotBundle> {
        const params = new HttpParams().set('currency', currency);
        return this.http.get<MetalsSpotBundle>(`${this.baseUrl}/spot`, { params });
    }

    getHistoryChart(currency: string = 'USD', days: number = 10): Observable<MetalHistoryChart> {
        let params = new HttpParams().set('currency', currency).set('days', String(days));
        return this.http.get<MetalHistoryChart>(`${this.baseUrl}/history-chart`, { params });
    }
}
