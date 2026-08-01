import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RecurringService, RecurringSettings, EmiItem } from '../services/recurring.service';
import { TransactionService } from '../services/transaction.service';

@Component({
  standalone: true,
  selector: 'salary-setup-page',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="setup-shell">
      <header class="setup-header">
        <div>
          <p class="eyebrow">Financial Foundation</p>
          <h1>Salary & EMI Setup</h1>
          <p class="subtitle">Set your baseline income and recurring commitments to clarify your monthly budget.</p>
        </div>
        <div class="header-actions">
          <a routerLink="/" class="icon-button" aria-label="Back to dashboard">
            <span class="material-symbols-outlined">arrow_back</span>
          </a>
          <button type="button" class="icon-button" aria-label="Help">
            <span class="material-symbols-outlined">help_outline</span>
          </button>
          <div class="avatar"></div>
        </div>
      </header>

      <form class="setup-form" (ngSubmit)="saveSettings()">
        <section class="card glass-card">
          <div class="section-header">
            <div class="section-title">
              <div class="section-icon section-icon--primary">
                <span class="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p class="section-label">Base Salary Amount</p>
                <h2 class="section-heading">Monthly Net Income</h2>
              </div>
            </div>
          </div>

          <div class="field-group">
            <label for="salary" class="field-label">Monthly Net Income</label>
            <div class="input-surface">
              <span class="currency-symbol">₹</span>
              <input
                id="salary"
                type="number"
                min="0"
                [(ngModel)]="salary"
                name="salary"
                class="text-input"
              />
            </div>
            <p class="field-note">Enter your take-home pay after taxes.</p>
          </div>
        </section>

        <section class="card glass-card">
          <div class="section-header section-header--spaced">
            <div class="section-title">
              <div class="section-icon section-icon--secondary">
                <span class="material-symbols-outlined">event_repeat</span>
              </div>
              <div>
                <p class="section-label">Recurring EMIs</p>
                <h2 class="section-heading">Manage monthly commitments</h2>
              </div>
            </div>
            <button class="action-link" type="button" (click)="addEmiItem()">
              <span class="material-symbols-outlined">add</span>
              Add Item
            </button>
          </div>

          <div class="emi-list">
            <div *ngFor="let emi of emiItems; let i = index" class="emi-row">
              <div class="emi-field">
                <label class="field-label">Item Name</label>
                <input
                  type="text"
                  class="text-input"
                  [(ngModel)]="emi.name"
                  [name]="'emiName' + emi.id"
                  placeholder="e.g. House Rent"
                />
              </div>
              <div class="emi-field emi-field--amount">
                <label class="field-label">Amount</label>
                <div class="input-surface">
                  <span class="currency-symbol">₹</span>
                  <input
                    type="number"
                    min="0"
                    class="text-input"
                    [(ngModel)]="emi.amount"
                    [name]="'emiAmount' + emi.id"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div class="emi-field emi-field--date">
                <label class="field-label">Due Date</label>
                <input
                  type="date"
                  class="text-input"
                  [(ngModel)]="emi.dueDate"
                  [name]="'emiDueDate' + emi.id"
                />
              </div>
              <button type="button" class="remove-button" (click)="removeEmiItem(emi.id)">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>

          <div class="summary-row">
            <span class="summary-label">Total Monthly Committed</span>
            <span class="summary-value">₹{{ totalCommitted | number:'1.2-2' }}</span>
          </div>
        </section>

        <div class="actions-row">
          <button type="submit" class="save-button">
            <span class="material-symbols-outlined">save</span>
            Save Settings
          </button>
        </div>
      </form>

      <nav class="bottom-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="bottom-nav__item">
          <span class="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </a>
        <a routerLink="/transactions" routerLinkActive="active" class="bottom-nav__item">
          <span class="material-symbols-outlined">receipt_long</span>
          <span>Transactions</span>
        </a>
        <a routerLink="/salary-setup" routerLinkActive="active" class="bottom-nav__item active">
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

      .setup-shell {
        min-height: 100vh;
        max-width: 900px;
        margin: 0 auto;
        padding: 1.25rem;
        background: #f9f9fc;
        position: relative;
      }

      .setup-header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: flex-start;
        margin-bottom: 1rem;
        padding: 1rem 0;
      }

      .eyebrow {
        margin: 0 0 0.5rem;
        color: #475569;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-weight: 700;
      }

      h1 {
        margin: 0;
        font-size: clamp(1.75rem, 2vw, 2.25rem);
        color: #0f172a;
        line-height: 1.1;
      }

      .subtitle {
        margin: 0.5rem 0 0;
        color: #64748b;
        font-size: 0.97rem;
        max-width: 560px;
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .icon-button {
        width: 3rem;
        height: 3rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        color: #0f172a;
        cursor: pointer;
      }

      .avatar {
        width: 3rem;
        height: 3rem;
        border-radius: 9999px;
        background: linear-gradient(135deg, #c7d2fe, #93c5fd);
        border: 1px solid #dbeafe;
      }

      .setup-form {
        display: grid;
        gap: 1rem;
      }

      .card {
        border-radius: 1.25rem;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
        padding: 1.25rem;
      }

      .glass-card {
        background: #ffffff;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1rem;
      }

      .section-header--spaced {
        align-items: flex-start;
      }

      .section-title {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.75rem;
        align-items: center;
      }

      .section-icon {
        width: 3rem;
        height: 3rem;
        display: grid;
        place-items: center;
        border-radius: 1rem;
      }

      .section-icon--primary {
        background: rgba(0, 62, 199, 0.1);
        color: #003ec7;
      }

      .section-icon--secondary {
        background: rgba(255, 218, 215, 0.45);
        color: #b91c1c;
      }

      .section-label {
        margin: 0;
        font-size: 0.9rem;
        color: #475569;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .section-heading {
        margin: 0.35rem 0 0;
        font-size: 1.15rem;
        color: #0f172a;
      }

      .field-group,
      .emi-row {
        display: grid;
        gap: 0.75rem;
      }

      .field-label {
        display: block;
        margin-bottom: 0.4rem;
        font-size: 0.95rem;
        color: #334155;
        font-weight: 700;
      }

      .input-surface {
        position: relative;
        display: flex;
        align-items: center;
        background: #f1f5f9;
        border-radius: 0.95rem;
        border: 1px solid transparent;
        transition: border-color 0.2s ease;
      }

      .input-surface:focus-within {
        border-color: #003ec7;
      }

      .currency-symbol {
        position: absolute;
        left: 1rem;
        color: #64748b;
        font-size: 0.95rem;
      }

      .text-input {
        width: 100%;
        padding: 1rem 1rem 1rem 2.5rem;
        border: none;
        background: transparent;
        font-size: 1rem;
        color: #0f172a;
        outline: none;
      }

      .field-note {
        margin: 0.5rem 0 0;
        color: #64748b;
        font-size: 0.9rem;
      }

      .action-link {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        border: none;
        background: none;
        color: #003ec7;
        font-weight: 700;
        cursor: pointer;
      }

      .emi-list {
        display: grid;
        gap: 0.75rem;
      }

      .emi-row {
        display: grid;
        gap: 0.75rem;
        padding: 0.8rem;
        border-radius: 1rem;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
      }

      .emi-row {
        grid-template-columns: 1fr auto;
        align-items: end;
      }

      .emi-field {
        display: grid;
        gap: 0.5rem;
      }

      .emi-field--amount {
        min-width: 170px;
      }

      .remove-button {
        width: 3rem;
        height: 3rem;
        display: grid;
        place-items: center;
        border-radius: 1rem;
        border: none;
        background: #fee2e2;
        color: #b91c1c;
        cursor: pointer;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
        margin-top: 1rem;
      }

      .summary-label {
        color: #475569;
        font-weight: 700;
      }

      .summary-value {
        font-size: 1.75rem;
        color: #003ec7;
        font-weight: 700;
      }

      .actions-row {
        display: flex;
        justify-content: flex-end;
        padding-top: 0.5rem;
      }

      .save-button {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.4rem;
        border: none;
        border-radius: 999px;
        background: #003ec7;
        color: #ffffff;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 18px 30px rgba(0, 62, 199, 0.24);
      }

      .bottom-nav {
        display: none;
      }

      @media (max-width: 768px) {
        .setup-shell {
          padding-bottom: 5rem;
        }

        .header-actions {
          align-items: center;
        }

        .emi-row {
          grid-template-columns: 1fr;
        }

        .bottom-nav {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 0.75rem 1rem 1rem;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          z-index: 10;
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
          border: 1px solid transparent;
        }

        .bottom-nav__item.active {
          background: #dde1ff;
          color: #003ec7;
          border-color: #dbeafe;
        }
      }
    `
  ]
})
export class SalarySetupPage implements OnInit {
  protected salary = 5000;
  protected emiItems: EmiItem[] = [
    { id: 'emi-1', name: 'House Rent', amount: 1200, dueDate: new Date().toISOString().slice(0, 10) },
    { id: 'emi-2', name: 'Car Loan', amount: 350, dueDate: new Date().toISOString().slice(0, 10) },
  ];

  constructor(private recurringService: RecurringService, private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  get totalCommitted(): number {
    return this.emiItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  addEmiItem(): void {
    const id = crypto?.randomUUID?.() ?? `emi-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);
    this.emiItems = [...this.emiItems, { id, name: '', amount: 0, dueDate: today }];
  }

  removeEmiItem(id: string): void {
    this.emiItems = this.emiItems.filter((item) => item.id !== id);
  }

  saveSettings(): void {
    const currentSettings = this.recurringService.getSettings();
    const settings: RecurringSettings = {
      salary: this.salary,
      emiItems: this.emiItems.map((item) => ({ ...item })),
      appliedMonths: currentSettings.appliedMonths,
    };
    this.recurringService.saveSettings(settings);
    const activeMonth = this.transactionService.getActiveMonth();
    if (activeMonth) {
      this.transactionService.applyRecurringTransactions(activeMonth);
    }
    alert('Settings saved');
  }

  private loadSettings(): void {
    const settings = this.recurringService.getSettings();
    this.salary = settings.salary;
    this.emiItems = settings.emiItems.length > 0 ? settings.emiItems : this.emiItems;
  }
}
