import { Routes } from '@angular/router';
import { DashboardPage } from './components/dashboard';
import { SalarySetupPage } from './components/salary-setup';
import { TransactionsList } from './components/transactions-list';
import { TransactionForm } from './components/transaction-form';

export const routes: Routes = [
  { path: '', component: DashboardPage },
  { path: 'transactions', component: TransactionsList },
  { path: 'salary-setup', component: SalarySetupPage },
  { path: 'add', component: TransactionForm },
  { path: 'edit/:id', component: TransactionForm },
  { path: '**', redirectTo: '' },
];
