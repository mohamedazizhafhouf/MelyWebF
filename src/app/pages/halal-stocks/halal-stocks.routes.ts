import { Routes } from '@angular/router';
import { HalalStocksScreeningPage } from './new-screening/halal-stocks-screening.page';
import { HalalStocksHistoryPage } from './history/halal-stocks-history.page';
import { HalalStockResultPage } from './result/halal-stock-result.page';

export default [
    { path: '', redirectTo: 'new', pathMatch: 'full' },
    { path: 'new', component: HalalStocksScreeningPage },
    { path: 'result/:requestId', component: HalalStockResultPage },
    { path: 'history', component: HalalStocksHistoryPage },
    { path: 'history/:requestId', component: HalalStocksHistoryPage }
] as Routes;
