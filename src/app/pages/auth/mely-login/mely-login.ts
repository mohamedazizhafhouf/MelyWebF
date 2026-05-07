import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-mely-login',
    standalone: true,
    providers: [MessageService],
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ToastModule],
    templateUrl: './mely-login.html',
    styleUrl: './mely-login.scss'
})
export class MelyLogin {
    email = '';
    password = '';
    rememberMe = true;
    isSubmitting = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {}

    onLogin() {
        if (!this.email.trim() || !this.password.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Missing info', detail: 'Please enter your email and password.' });
            return;
        }

        this.isSubmitting = true;
        this.authService.login({
            email: this.email.trim(),
            password: this.password
        }).subscribe({
            next: (response) => {
                if (response.accountType !== 'SAAS') {
                    this.authService.logout();
                    this.isSubmitting = false;
                    this.messageService.add({ severity: 'error', summary: 'Wrong portal', detail: 'This login page is for personal Mely users only.' });
                    return;
                }

                this.messageService.add({ severity: 'success', summary: 'Welcome back', detail: 'Your Mely dashboard is ready.' });
                setTimeout(() => this.router.navigate(['/']), 700);
            },
            error: (error) => {
                this.isSubmitting = false;
                const message = error?.error?.message ?? 'Unable to sign in right now.';
                this.messageService.add({ severity: 'error', summary: 'Login failed', detail: message });
            },
            complete: () => {
                this.isSubmitting = false;
            }
        });
    }
}
