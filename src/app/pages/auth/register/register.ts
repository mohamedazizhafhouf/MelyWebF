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
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
    selector: 'app-register',
    standalone: true,
    providers: [MessageService],
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ToastModule],
    templateUrl: './register.html',
    styleUrl: './register.scss'
})
export class Register {
    firstName: string = '';
    lastName: string = '';
    email: string = '';
    password: string = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {}

    onRegister() {
        const signupData: RegisterRequest = {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            password: this.password
        };

        this.authService.register(signupData).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Account Created',
                    detail: 'Redirecting to login...'
                });
                setTimeout(() => {
                    this.router.navigate(['/auth/login']);
                }, 1500);
            },
            error: (err) => {
                const errorMsg = err.error?.message || 'Registration failed';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMsg
                });
            }
        });
    }
}
