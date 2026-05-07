import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-mely-guidance-widget',
    standalone: true,
    imports: [CommonModule, RouterModule, TagModule],
    template: `
        <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card h-full">
                <div class="font-semibold text-xl mb-3">Portfolio purification guidance</div>
                <p class="text-muted-color leading-relaxed">
                    When a stock is halal but still contains a small non-compliant revenue portion, Mely explains whether tatheer is needed and how the purification ratio was derived.
                </p>
                <div class="guide-stack mt-5">
                    <div class="guide-row">
                        <span class="guide-label">User benefit</span>
                        <strong>Understands why purification exists</strong>
                    </div>
                    <div class="guide-row">
                        <span class="guide-label">Backend support</span>
                        <strong>Tatheer and explanation already implemented</strong>
                    </div>
                </div>
                <div class="mt-5">
                    <p-tag severity="success" value="Trust-building experience"></p-tag>
                </div>
            </div>
        </div>
    `,
    styles: `
        .guide-stack {
            display: grid;
            gap: 0.9rem;
        }

        .guide-row {
            border: 1px solid var(--surface-border);
            border-radius: 1rem;
            padding: 1rem;
        }

        .guide-label {
            color: var(--text-color-secondary);
            display: block;
            font-size: 0.8rem;
            margin-bottom: 0.35rem;
            text-transform: uppercase;
        }
    `
})
export class MelyGuidanceWidget {}
