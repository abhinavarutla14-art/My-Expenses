import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { TransactionService } from '../services/transaction.service';
import { RecurringService } from '../services/recurring.service';
import { Transaction } from '../models/transaction';
import { CalendarPicker } from './calendar-picker';

@Component({
  standalone: true,
  selector: 'dashboard-page',
  imports: [CommonModule, FormsModule, RouterModule, CalendarPicker],
  template: `
    <section class="dashboard-page">
      <header class="top-app-bar">
        <div class="top-app-bar__start">
          <div class="avatar"></div>
          <div>
            <p class="eyebrow">My Expenses</p>
          </div>
        </div>
        <button class="icon-button" type="button" aria-label="Notifications">
          <span class="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main class="dashboard-content">
        <section class="hero-card">
          <div class="hero-card__background">
            <span class="material-symbols-outlined large-icon">account_balance_wallet</span>
          </div>
          <div class="hero-card__content">
            <p class="hero-card__label">Total Balance</p>
            <h1 class="hero-card__amount">{{ totalBalance | number:'1.2-2' }}</h1>
            <div class="hero-card__stats">
              <div class="hero-card__stat">
                <span class="hero-card__stat-label">Salary baseline</span>
                <strong>₹{{ salary | number:'1.0-0' }}</strong>
              </div>
              <div class="hero-card__stat hero-card__stat--committed">
                <span class="hero-card__stat-label">Recurring committed</span>
                <strong>₹{{ recurringCommitted | number:'1.0-0' }}</strong>
              </div>
            </div>
            <div class="hero-card__change">
              <span class="material-symbols-outlined small-icon">trending_up</span>
              <span>+{{ percentChange | number:'1.1-2' }}% vs last month</span>
            </div>
          </div>
        </section>

        <div class="summary-grid">
          <article class="summary-card summary-card--income">
            <div class="summary-card__header">
              <div class="summary-card__icon summary-card__icon--income">
                <span class="material-symbols-outlined">arrow_downward</span>
              </div>
              <p class="summary-card__label">Income</p>
            </div>
            <h2 class="summary-card__value">{{ income | number:'1.2-2' }}</h2>
          </article>
          <article class="summary-card summary-card--expense">
            <div class="summary-card__header">
              <div class="summary-card__icon summary-card__icon--expense">
                <span class="material-symbols-outlined">arrow_upward</span>
              </div>
              <p class="summary-card__label">Expenses</p>
            </div>
            <h2 class="summary-card__value">{{ expense | number:'1.2-2' }}</h2>
          </article>
        </div>

        <div class="recurring-grid">
          <article class="summary-card summary-card--salary">
            <div class="summary-card__header">
              <div class="summary-card__icon summary-card__icon--salary">
                <span class="material-symbols-outlined">account_balance</span>
              </div>
              <p class="summary-card__label">Salary Baseline</p>
            </div>
            <h2 class="summary-card__value">{{ salary | number:'1.2-2' }}</h2>
          </article>
          <article class="summary-card summary-card--committed">
            <div class="summary-card__header">
              <div class="summary-card__icon summary-card__icon--committed">
                <span class="material-symbols-outlined">calendar_today</span>
              </div>
              <p class="summary-card__label">Recurring Committed</p>
            </div>
            <h2 class="summary-card__value">{{ recurringCommitted | number:'1.2-2' }}</h2>
          </article>
        </div>
        <div class="recurring-actions">
          <div class="month-picker-card">
            <p class="month-picker-label">Month & year</p>
            <button type="button" class="month-picker-button" (click)="openMonthPicker()">
              <span>{{ selectedMonth + '-01' | date:'MMMM, yyyy' }}</span>
              <span class="material-symbols-outlined">calendar_today</span>
            </button>
          </div>
          <button type="button" class="recurring-button" (click)="applyRecurringForNewMonth()">
            Start selected month
          </button>
          <p class="recurring-status">{{ recurringStatus }}</p>
          <p class="active-month-note" *ngIf="activeMonth">Active month for new entries: {{ activeMonth }}</p>
          <p class="active-month-note" *ngIf="!activeMonth">Select and start a month before adding new entries.</p>
        </div>
        <calendar-picker
          [isOpen]="monthPickerOpen"
          [selectedDateValue]="selectedMonth + '-01'"
          (dateSelected)="onMonthSelected($event)"
          (closed)="closeMonthPicker()">
        </calendar-picker>

        <section class="recent-transactions">
          <div class="section-title-row">
            <h2>Recent Transactions</h2>
            <a routerLink="/transactions" class="link-button">View All</a>
          </div>

          <div class="transaction-list">
            <ng-container *ngIf="recentTransactions.length; else emptyState">
              <article *ngFor="let transaction of recentTransactions" class="transaction-item">
                <div class="transaction-item__info">
                  <div class="transaction-item__icon">
                    <span class="material-symbols-outlined">{{ transaction.type === 'income' ? 'work' : 'shopping_cart' }}</span>
                  </div>
                  <div>
                    <p class="transaction-item__title">{{ transaction.category }}</p>
                    <p class="transaction-item__meta">{{ transaction.note || (transaction.type === 'income' ? 'Salary' : 'Expense') }} • {{ transaction.date | date:'mediumDate' }}</p>
                  </div>
                </div>
                <p class="transaction-item__amount" [class.positive]="transaction.type === 'income'" [class.negative]="transaction.type === 'expense'">
                  {{ transaction.type === 'income' ? '+' : '-' }}{{ transaction.amount | number:'1.2-2' }}
                </p>
              </article>
            </ng-container>
            <ng-template #emptyState>
              <div class="empty-state">No recent transactions available.</div>
            </ng-template>
          </div>
        </section>
      </main>

      <button class="fab-button" routerLink="/add" aria-label="Add transaction">
        <span class="material-symbols-outlined fab-icon">add</span>
      </button>

      <nav class="bottom-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="bottom-nav__item">
          <span class="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </a>
        <a routerLink="/transactions" routerLinkActive="active" class="bottom-nav__item">
          <span class="material-symbols-outlined">receipt_long</span>
          <span>Transactions</span>
        </a>
        <a routerLink="/salary-setup" routerLinkActive="active" class="bottom-nav__item">
          <span class="material-symbols-outlined">calendar_today</span>
          <span>Recurring</span>
        </a>
      </nav>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .dashboard-page {
        min-height: 100vh;
        padding: 1rem;
        background: #f8fafc;
        position: relative;
      }

      .top-app-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #ffffff;
        border-radius: 1rem;
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
        position: sticky;
        top: 0;
        z-index: 20;
      }

      .top-app-bar__start {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .avatar {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 9999px;
        background: linear-gradient(135deg, #2b6cb0, #90cdf4);
        border: 2px solid #dbeafe;
      }

      .eyebrow {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: #0f172a;
      }

      .icon-button {
        width: 3rem;
        height: 3rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        border: 1px solid rgba(15, 23, 42, 0.08);
        background: #ffffff;
        color: #0f172a;
        cursor: pointer;
      }

      .dashboard-content {
        display: grid;
        gap: 1rem;
        margin-top: 1rem;
      }

      .hero-card {
        position: relative;
        overflow: hidden;
        border-radius: 1.25rem;
        background: #0052ff;
        color: white;
        padding: 1.5rem;
        min-height: 220px;
      }

      .hero-card__background {
        position: absolute;
        right: 1.25rem;
        top: 1rem;
        opacity: 0.12;
        pointer-events: none;
      }

      .large-icon {
        font-size: 7rem;
      }

      .hero-card__label {
        margin: 0;
        font-size: 0.75rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        opacity: 0.85;
      }

      .hero-card__amount {
        margin: 0.75rem 0;
        font-size: clamp(2.5rem, 5vw, 4rem);
        line-height: 1;
      }

      .hero-card__stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .hero-card__stat {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.85rem 1rem;
        border-radius: 1rem;
        background: rgba(255,255,255,0.18);
        border: 1px solid rgba(255,255,255,0.22);
      }

      .hero-card__stat--committed {
        background: rgba(255,255,255,0.14);
      }

      .hero-card__stat-label {
        color: rgba(255,255,255,0.87);
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .hero-card__stat strong {
        color: white;
        font-size: 1.15rem;
      }

      .hero-card__change {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: rgba(255,255,255,0.12);
        border-radius: 999px;
        font-weight: 600;
      }

      .small-icon {
        font-size: 1rem;
      }

      .summary-grid,
      .recurring-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .recurring-actions {
        display: grid;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }

      .month-picker-label {
        display: grid;
        gap: 0.35rem;
        font-size: 0.85rem;
        color: #475569;
      }

      .month-picker-button {
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 0.75rem;
        padding: 0.95rem 1rem;
        border-radius: 1rem;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        color: #0f172a;
        cursor: pointer;
        font-size: 1rem;
      }

      .month-picker-button:hover {
        background: #f8fafc;
      }

      .month-picker-label {
        display: block;
        font-size: 0.85rem;
        color: #475569;
        margin-bottom: 0.5rem;
      }

      .recurring-button {
        width: fit-content;
        padding: 0.85rem 1rem;
        border: none;
        border-radius: 999px;
        background: #003ec7;
        color: white;
        font-weight: 700;
        cursor: pointer;
      }

      .recurring-status,
      .active-month-note {
        margin: 0;
        color: #334155;
        font-size: 0.95rem;
      }

      .summary-card {
        padding: 1rem;
        border-radius: 1rem;
        background: white;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
      }

      .summary-card__header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
      }

      .summary-card__icon {
        width: 2.25rem;
        height: 2.25rem;
        display: grid;
        place-items: center;
        border-radius: 0.75rem;
      }

      .summary-card__icon--income {
        background: rgba(102, 253, 172, 0.15);
        color: #047857;
      }

      .summary-card__icon--expense {
        background: rgba(255, 218, 215, 0.35);
        color: #b91c1c;
      }

      .summary-card__icon--salary {
        background: rgba(221, 225, 255, 0.6);
        color: #003ec7;
      }

      .summary-card__icon--committed {
        background: rgba(255, 235, 205, 0.75);
        color: #b45309;
      }

      .summary-card__label {
        margin: 0;
        color: #64748b;
        font-weight: 600;
      }

      .summary-card__value {
        margin: 0;
        font-size: 1.75rem;
        color: #0f172a;
      }

      .recent-transactions {
        display: grid;
        gap: 1rem;
      }

      .section-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .section-title-row h2 {
        margin: 0;
        font-size: 1.25rem;
        color: #0f172a;
      }

      .link-button {
        color: #003ec7;
        font-weight: 600;
        text-decoration: none;
      }

      .transaction-list {
        display: grid;
        gap: 0.75rem;
      }

      .transaction-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem;
        border-radius: 1rem;
        background: white;
        border: 1px solid #e2e8f0;
      }

      .transaction-item__info {
        display: flex;
        gap: 1rem;
        align-items: center;
        min-width: 0;
      }

      .transaction-item__icon {
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 1rem;
        display: grid;
        place-items: center;
        background: #f8fafc;
        color: #64748b;
      }

      .transaction-item__title {
        margin: 0;
        font-weight: 700;
        color: #0f172a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .transaction-item__meta {
        margin: 0.25rem 0 0;
        color: #64748b;
        font-size: 0.95rem;
      }

      .transaction-item__amount {
        margin: 0;
        font-weight: 700;
        min-width: 5.5rem;
        text-align: right;
      }

      .transaction-item__amount.positive {
        color: #047857;
      }

      .transaction-item__amount.negative {
        color: #b91c1c;
      }

      .empty-state {
        padding: 1rem;
        border-radius: 1rem;
        background: #f8fafc;
        text-align: center;
        color: #64748b;
      }

      .fab-button {
        position: fixed;
        right: 1.25rem;
        bottom: 5.5rem;
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 9999px;
        border: none;
        background: #003ec7;
        color: white;
        display: grid;
        place-items: center;
        box-shadow: 0 16px 32px rgba(0, 62, 199, 0.24);
        cursor: pointer;
      }

      .fab-icon {
        font-size: 1.5rem;
      }

      .bottom-nav {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
        padding: 0.75rem 1rem 1rem;
        background: #ffffff;
        border-top: 1px solid #e2e8f0;
      }

      .bottom-nav__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        padding: 0.85rem;
        border-radius: 1rem;
        text-decoration: none;
        color: #64748b;
        font-size: 0.85rem;
      }

      .bottom-nav__item.active {
        background: #dde1ff;
        color: #003ec7;
      }

      @media (max-width: 640px) {
        .summary-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class DashboardPage implements OnInit {
  protected income = 0;
  protected expense = 0;
  protected totalBalance = 0;
  protected percentChange = 2.4;
  protected recentTransactions: Transaction[] = [];
  protected salary = 0;
  protected recurringCommitted = 0;
  protected recurringStatus = '';
  protected selectedMonth = new Date().toISOString().slice(0, 7);
  protected activeMonth = '';
  protected monthPickerOpen = false;

  constructor(private transactionService: TransactionService, private recurringService: RecurringService) {}

  protected openMonthPicker(): void {
    this.monthPickerOpen = true;
  }

  protected closeMonthPicker(): void {
    this.monthPickerOpen = false;
  }

  protected onMonthSelected(dateValue: string): void {
    if (!dateValue) {
      return;
    }
    this.selectedMonth = dateValue.slice(0, 7);
    this.closeMonthPicker();
  }

  ngOnInit(): void {
    this.activeMonth = this.transactionService.getActiveMonth() ?? '';
    if (this.activeMonth) {
      this.selectedMonth = this.activeMonth;
    }
    this.transactionService.applyRecurringTransactions(this.selectedMonth);
    this.loadDashboardData();
    this.loadRecurringSummary();
  }

  protected applyRecurringForNewMonth(): void {
    const applied = this.transactionService.applyRecurringTransactions(this.selectedMonth);
    this.transactionService.setActiveMonth(this.selectedMonth);
    this.activeMonth = this.selectedMonth;
    this.loadDashboardData();
    this.loadRecurringSummary();
    this.recurringStatus = applied
      ? `Month ${this.selectedMonth} started.`
      : `Month ${this.selectedMonth} is already applied.`;
    setTimeout(() => (this.recurringStatus = ''), 4000);
  }

  private loadDashboardData(): void {
    const all = this.transactionService.getAll();
    this.recentTransactions = all.slice(0, 4);
    this.income = all
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    this.expense = all
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    this.totalBalance = this.income - this.expense;
  }

  private loadRecurringSummary(): void {
    const settings = this.recurringService.getSettings();
    this.salary = settings.salary;
    this.recurringCommitted = settings.emiItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  }
}
