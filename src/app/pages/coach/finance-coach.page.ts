import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { FinanceCoachInsightCard, FinanceCoachInsights, FinanceCoachMessage } from '../../core/models/coach.model';
import { PersonalCoachService } from '../../services/personal-coach.service';

@Component({
    selector: 'app-finance-coach-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ToastModule,
        AvatarModule,
        ButtonModule,
        CardModule,
        DividerModule,
        ProgressSpinnerModule,
        TagModule,
        TextareaModule
    ],
    providers: [MessageService],
    templateUrl: './finance-coach.page.html',
    styleUrl: './finance-coach.page.scss'
})
export class FinanceCoachPage implements OnInit {
    private readonly coachApi = inject(PersonalCoachService);
    private readonly messages = inject(MessageService);

    readonly yearMonth = signal(this.currentYearMonth());
    readonly insights = signal<FinanceCoachInsights | null>(null);
    readonly chatMessages = signal<FinanceCoachMessage[]>([]);
    readonly loadingInsights = signal(false);
    readonly sending = signal(false);
    readonly prompt = signal('');

    readonly suggestions = [
        'How can I improve my budget this month?',
        'Am I ready for zakat?',
        'What should I watch before investing?',
        'How do my goals affect my zakat planning?'
    ];

    readonly scoreTone = computed(() => {
        const score = this.insights()?.healthScore ?? 0;
        if (score >= 80) {
            return 'strong';
        }
        if (score >= 60) {
            return 'steady';
        }
        return 'attention';
    });

    ngOnInit(): void {
        this.refreshInsights();
        this.loadHistory();
    }

    refreshInsights(): void {
        this.loadingInsights.set(true);
        this.coachApi.monthlyInsights(this.yearMonth()).subscribe({
            next: (response) => {
                this.insights.set(response);
                this.loadingInsights.set(false);
            },
            error: () => {
                this.loadingInsights.set(false);
                this.messages.add({ severity: 'error', summary: 'Coach', detail: 'Could not load monthly insights.' });
            }
        });
    }

    loadHistory(): void {
        this.coachApi.chatHistory().subscribe({
            next: (history) => this.chatMessages.set(history.messages ?? []),
            error: () => this.chatMessages.set([])
        });
    }

    onMonthChange(value: string): void {
        this.yearMonth.set(value);
        this.refreshInsights();
    }

    ask(prefilled?: string): void {
        const message = (prefilled ?? this.prompt()).trim();
        if (!message || this.sending()) {
            return;
        }

        const localUser: FinanceCoachMessage = {
            id: `local-${Date.now()}`,
            role: 'USER',
            content: message,
            yearMonth: this.yearMonth(),
            createdAt: new Date().toISOString()
        };
        this.chatMessages.set([...this.chatMessages(), localUser]);
        this.prompt.set('');
        this.sending.set(true);

        this.coachApi.chat(message, this.yearMonth()).subscribe({
            next: (response) => {
                this.chatMessages.set([...this.chatMessages(), response.assistantMessage]);
                this.sending.set(false);
            },
            error: () => {
                this.sending.set(false);
                this.messages.add({ severity: 'error', summary: 'Coach', detail: 'The coach could not answer right now.' });
            }
        });
    }

    severity(card: FinanceCoachInsightCard) {
        switch (card.severity) {
            case 'GOOD':
                return 'success';
            case 'WARN':
                return 'warn';
            case 'DANGER':
                return 'danger';
            default:
                return 'info';
        }
    }

    formatTime(value: string | null | undefined): string {
        if (!value) {
            return '';
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }
        return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date);
    }

    private currentYearMonth(): string {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
}
