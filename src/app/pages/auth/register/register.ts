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
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';
import { UserRole } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  providers: [MessageService],
  imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

    firstName: string = '';
    lastName: string = '';
    email: string = '';
    password: string = '';
    selectedRole: UserRole = UserRole.USER;
    
    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {
          console.log('constructor fired');

    }

    onRegister() {

    if (!this.authService) {
        console.error('3. AuthService is MISSING!');
        return;
    }
        // Basic validation
        

        // Prepare the payload based on your Swagger DTO
        const signupData: RegisterRequest = {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            password: this.password,
            role: this.selectedRole
        };

        // Call the service
        this.authService.register(signupData).subscribe({
            next: (res) => {
                console.log('Entered the register of Auth Service, attempting to register !');

                this.messageService.add({ 
                    severity: 'success', 
                    summary: 'Account Created', 
                    detail: 'Redirecting to login...' 
                });
                console.log('Success!', res);

                // Small delay so the user can see the success toast
                setTimeout(() => {
                    this.router.navigate(['/auth/login']);
                }, 1500);
            },
            error: (err) => {
                // Extracts the error message from your Node.js backend
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
