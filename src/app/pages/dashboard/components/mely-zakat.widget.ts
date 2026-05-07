import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-mely-zakat-widget',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule],
    template: `
        <div class="col-span-12 xl:col-span-5">
            <div class="card zakat-widget h-full">
                <div class="eyebrow mb-3">Giving &amp; purification</div>
                <h2 class="text-2xl font-semibold mb-3">Zakat estimator</h2>
                <p class="text-muted-color leading-relaxed mb-5">
                    Rough-check niṣāb against gold, net zakatable wealth, and 2.5% due— with clear disclaimers. Educational
                    only; not a fatwa.
                </p>
                <a pButton routerLink="/zakat" icon="pi pi-calculator" label="Open Zakat calculator"></a>
            </div>
        </div>
    `,
    styles: `
        .zakat-widget {
            background: linear-gradient(135deg, rgba(180, 83, 9, 0.08), rgba(250, 250, 249, 0.96));
            border: 1px solid rgba(180, 83, 9, 0.12);
        }

        .eyebrow {
            color: #b45309;
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }
    `
})
export class MelyZakatWidget {}
