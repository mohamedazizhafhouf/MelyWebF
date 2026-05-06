import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { RegisterRequest } from '../../../core/models/auth.model';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-mely-register',
    standalone: true,
    providers: [MessageService],
    imports: [ButtonModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ToastModule, AppFloatingConfigurator],
    templateUrl: './mely-register.html',
    styleUrl: './mely-register.scss'
})
export class MelyRegister {
    firstName = '';
    lastName = '';
    email = '';
    password = '';
    confirmPassword = '';
    isSubmitting = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {}

    onRegister() {
        if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Missing info', detail: 'Please fill in all registration fields.' });
            return;
        }

        if (this.password.length < 8) {
            this.messageService.add({ severity: 'warn', summary: 'Weak password', detail: 'Password must be at least 8 characters.' });
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.messageService.add({ severity: 'warn', summary: 'Password mismatch', detail: 'Password confirmation does not match.' });
            return;
        }

        const payload: RegisterRequest = {
            firstName: this.firstName.trim(),
            lastName: this.lastName.trim(),
            email: this.email.trim(),
            password: this.password
        };

        this.isSubmitting = true;
        this.authService.register(payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Account created', detail: 'Your Mely account is ready. Please sign in.' });
                setTimeout(() => this.router.navigate(['/auth/login']), 900);
            },
            error: (error) => {
                this.isSubmitting = false;
                const message = error?.error?.message ?? 'Unable to create your account right now.';
                this.messageService.add({ severity: 'error', summary: 'Registration failed', detail: message });
            },
            complete: () => {
                this.isSubmitting = false;
            }
        });
    }
}
