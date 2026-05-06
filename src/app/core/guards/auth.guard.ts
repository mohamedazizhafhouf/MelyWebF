import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

const requireAuthentication = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isSaasUserSession()) {
        return true;
    }

    authService.logout();
    return router.createUrlTree(['/auth/login']);
};

export const authGuard: CanActivateFn = () => requireAuthentication();
export const authChildGuard: CanActivateChildFn = () => requireAuthentication();
