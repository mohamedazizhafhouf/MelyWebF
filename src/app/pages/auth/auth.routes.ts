import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { Register } from './register/register';
import { MelyLogin } from './mely-login/mely-login';
import { MelyRegister } from './mely-register/mely-register';

export default [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'template-login', component: Login },
    { path: 'template-register', component: Register },
    { path: 'login', component: MelyLogin },
    { path: 'register', component: MelyRegister }
] as Routes;
