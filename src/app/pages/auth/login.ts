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
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    providers: [MessageService],
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
    templateUrl: './login.html'
})
export class Login {
email: string = '';
    password: string = '';
    checked: boolean = false;

    constructor(
        private authService: AuthService, 
        private router: Router,
        private messageService: MessageService
    ) {}

    onLogin() {
        if (!this.email || !this.password) {
            this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Please fill in all fields' });
            return;
        }

        const loginData = {
            email: this.email,
            password: this.password
        };

        this.authService.login(loginData).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Welcome back!' });
                
                // Navigate to dashboard after small delay to show the toast
                setTimeout(() => {
                    this.router.navigate(['/']);
                }, 1000);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid email or password' });
            }
        });
    }
    
}


