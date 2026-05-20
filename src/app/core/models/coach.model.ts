export type CoachSeverity = 'GOOD' | 'INFO' | 'WARN' | 'DANGER';

export interface FinanceCoachInsightCard {
    type: string;
    severity: CoachSeverity;
    title: string;
    message: string;
    actionLabel: string;
    actionRoute: string;
}

export interface FinanceCoachInsights {
    yearMonth: string;
    summary: string;
    healthScore: number;
    cards: FinanceCoachInsightCard[];
    generatedAt: string;
}

export interface FinanceCoachMessage {
    id: string;
    role: 'USER' | 'ASSISTANT';
    content: string;
    yearMonth: string;
    createdAt: string;
}

export interface FinanceCoachChatHistory {
    messages: FinanceCoachMessage[];
}

export interface FinanceCoachChatResponse {
    assistantMessage: FinanceCoachMessage;
}
