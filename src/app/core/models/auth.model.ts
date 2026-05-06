export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegistrationResponse {
    message: string;
    userId: string;
    email: string;
    sessionId: string | null;
}

export interface LoginResponse {
    token: string;
    tokenType: string;
    email: string;
    role: string;
    organizationId: string | null;
    accountType: 'SAAS' | 'BANK';
    message: string;
}

export interface StoredSession {
    token: string;
    tokenType: string;
    email: string;
    role: string;
    organizationId: string | null;
    accountType: 'SAAS' | 'BANK';
}
