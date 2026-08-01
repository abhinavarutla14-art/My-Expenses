import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TransactionService } from '../services/transaction.service';
import { Transaction } from '../models/transaction';
import { CalendarPicker } from './calendar-picker';

@Component({
  standalone: true,
  selector: 'transaction-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CalendarPicker],
  template: `
    <section class="transaction-shell">
      <header class="transaction-header">
        <button class="icon-button" type="button" (click)="cancel()" aria-label="Go back">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <p class="eyebrow">{{ modeLabel }}</p>
          <h1>{{ pageTitle }}</h1>
        </div>
        <div class="spacer"></div>
      </header>

      <div class="amount-display-card">
        <span class="label">ENTER AMOUNT</span>
        <div class="amount-display">
          <span class="currency">₹</span>
          <span class="amount">{{ amountDisplay }}</span>
        </div>
      </div>

      <div class="form-grid">
        <div class="field">
          <label class="field-label">Type</label>
          <div class="type-toggle">
            <button type="button" [class.active]="type === 'income'" (click)="setType('income')">Income</button>
            <button type="button" [class.active]="type === 'expense'" (click)="setType('expense')">Expense</button>
          </div>
        </div>

        <div class="field">
          <label class="field-label">DESCRIPTION</label>
          <div class="input-with-icon">
            <input
              name="customDescription"
              class="text-input"
              type="text"
              placeholder="Type a description like Movie ticket or Recharge"
              [value]="form.get('category')?.value || ''"
              (input)="updateCustomCategory($any($event.target).value)"
            />
          </div>
          <div class="field-hint">Enter any description you want for this transaction.</div>
          <div class="error" *ngIf="form.get('category')?.invalid && form.get('category')?.touched">
            <small *ngIf="form.get('category')?.errors?.['required']">Description is required.</small>
          </div>
        </div>

        <div class="field">
          <label class="field-label">DATE</label>
          <button type="button" class="date-picker-button" (click)="openDatePicker()">
            <span class="material-symbols-outlined calendar-icon">calendar_today</span>
            <span *ngIf="form.get('date')?.value">{{ form.get('date')?.value | date:'MMM dd, yyyy' }}</span>
            <span *ngIf="!form.get('date')?.value" class="placeholder">Select date</span>
          </button>
          <div class="field-hint" *ngIf="activeMonth && !editingId">
            Transactions will be created within {{ activeMonth }}.
          </div>
          <div class="field-hint warning" *ngIf="!activeMonth && !editingId">
            Select and start a month on the dashboard before adding new entries.
          </div>
          <div class="error" *ngIf="form.get('date')?.invalid && form.get('date')?.touched">
            <small>Date is required.</small>
          </div>
        </div>

        <calendar-picker
          [isOpen]="datePickerOpen"
          [selectedDateValue]="form.get('date')?.value"
          (dateSelected)="onDateSelected($event)"
          (closed)="onDatePickerClosed()">
        </calendar-picker>
      </div>

      <div class="numpad-grid">
        <button type="button" class="numpad-key" (click)="appendNumber('1')">1</button>
        <button type="button" class="numpad-key" (click)="appendNumber('2')">2</button>
        <button type="button" class="numpad-key" (click)="appendNumber('3')">3</button>
        <button type="button" class="numpad-key" (click)="appendNumber('4')">4</button>
        <button type="button" class="numpad-key" (click)="appendNumber('5')">5</button>
        <button type="button" class="numpad-key" (click)="appendNumber('6')">6</button>
        <button type="button" class="numpad-key" (click)="appendNumber('7')">7</button>
        <button type="button" class="numpad-key" (click)="appendNumber('8')">8</button>
        <button type="button" class="numpad-key" (click)="appendNumber('9')">9</button>
        <button type="button" class="numpad-key" (click)="appendNumber('.')">.</button>
        <button type="button" class="numpad-key" (click)="appendNumber('0')">0</button>
        <button type="button" class="numpad-key delete-key" (click)="deleteNumber()">
          <span class="material-symbols-outlined">backspace</span>
        </button>
      </div>

      <div class="save-area">
        <button type="button" class="save-button" [disabled]="form.invalid || (!activeMonth && !editingId)" (click)="submit()">
          {{ submitLabel }}
        </button>
      </div>
      <div class="error" *ngIf="activeMonthWarning">
        <small>{{ activeMonthWarning }}</small>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .transaction-shell { min-height: 100vh; background: #f9f9fc; padding: 1rem; max-width: 520px; margin: 0 auto; }
    .transaction-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .icon-button { width: 2.75rem; height: 2.75rem; border-radius: 1rem; border: 1px solid #e2e8f0; background: white; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
    .eyebrow { margin: 0 0 0.25rem; color: #64748b; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.12em; }
    h1 { margin: 0; font-size: 1.35rem; color: #0f172a; }
    .spacer { flex: 1; }
    .amount-display-card { background: white; border: 1px solid #e2e8f0; border-radius: 1.5rem; padding: 1.25rem; text-align: center; box-shadow: 0 15px 40px rgba(15, 23, 42, 0.06); }
    .label { display: block; font-size: 0.85rem; color: #64748b; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.8rem; }
    .amount-display { display: inline-flex; align-items: baseline; gap: 0.5rem; font-size: 2.5rem; font-weight: 700; color: #0f172a; }
    .currency { font-size: 1.5rem; color: #0f172a; }
    .form-grid { display: grid; gap: 1rem; margin: 1.25rem 0; }
    .field { display: grid; gap: 0.5rem; }
    .field-label { font-weight: 700; color: #334155; }
    .type-toggle { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
    .type-toggle button { padding: 0.9rem 1rem; border-radius: 1rem; border: 1px solid #e2e8f0; background: white; color: #475569; font-weight: 700; cursor: pointer; }
    .type-toggle button.active { background: #dde1ff; border-color: #bbc8ff; color: #003ec7; }
    .category-row { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.25rem; }
    .category-chip { white-space: nowrap; padding: 0.8rem 1rem; border-radius: 999px; border: 1px solid #e2e8f0; background: white; color: #475569; cursor: pointer; transition: all 0.2s ease; }
    .category-chip.active { background: #dde1ff; border-color: #bbc8ff; color: #003ec7; }
    .input-with-icon { position: relative; }
    .text-input { width: 100%; padding: 1rem 1rem 1rem 1rem; border-radius: 1rem; border: 1px solid #e2e8f0; background: #f8fafc; color: #0f172a; }
    .calendar-icon { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: #64748b; }
    .date-picker-button { width: 100%; padding: 1rem 1rem 1rem 1rem; border-radius: 1rem; border: 1px solid #e2e8f0; background: #f8fafc; color: #0f172a; font-size: 1rem; text-align: left; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.2s ease; position: relative; }
    .date-picker-button:hover { background: #eef2ff; border-color: #bbc8ff; }
    .date-picker-button:active { background: #dde1ff; }
    .date-picker-button .calendar-icon { position: relative; right: auto; transform: none; color: #003ec7; font-size: 1.25rem; flex-shrink: 0; }
    .date-picker-button .placeholder { color: #94a3b8; }
    .field-hint { color: #475569; font-size: 0.9rem; margin-top: 0.25rem; }
    .field-hint.warning { color: #b91c1c; }
    .error small { color: #b91c1c; }
    .numpad-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; margin-top: 1rem; }
    .numpad-key { height: 72px; border-radius: 1rem; border: 1px solid #e2e8f0; background: white; color: #0f172a; font-size: 1.15rem; font-weight: 700; display: grid; place-items: center; cursor: pointer; transition: transform 0.1s ease, background 0.1s ease; }
    .numpad-key:active { transform: scale(0.96); background: #f1f5f9; }
    .delete-key { color: #b91c1c; }
    .save-area { margin-top: 1.5rem; }
    .save-button { width: 100%; padding: 1rem 1.25rem; border: none; border-radius: 1.25rem; background: #003ec7; color: white; font-size: 1rem; font-weight: 700; cursor: pointer; box-shadow: 0 16px 32px rgba(0, 62, 199, 0.24); }
    .save-button:disabled { opacity: 0.65; cursor: not-allowed; }

    @media (max-width: 560px) {
      .transaction-shell { padding: 0.9rem; }
      .amount-display { font-size: 2rem; }
      .numpad-key { height: 60px; }
    }
  `]
})
export class TransactionForm implements OnInit {
  form!: ReturnType<FormBuilder['group']>;
  mode: string = 'Add';
  editingId: string | null = null;
  amountDisplay = '0';
  type: 'income' | 'expense' = 'income';
  activeMonth = '';
  minDate = '';
  maxDate = '';
  activeMonthWarning = '';
  datePickerOpen = false;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  get pageTitle(): string {
    return this.mode === 'Edit' ? `${this.mode} ${this.type === 'income' ? 'Income' : 'Expense'}` : `Add ${this.type === 'income' ? 'Income' : 'Expense'}`;
  }

  get modeLabel(): string {
    return this.mode === 'Edit' ? 'Edit transaction' : 'Add transaction';
  }

  get submitLabel(): string {
    return this.mode === 'Edit' ? 'Save changes' : `Add ${this.type === 'income' ? 'Income' : 'Expense'}`;
  }

  private initializeForm() {
    this.form = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      type: ['income'],
      category: ['', Validators.required],
      date: ['', Validators.required],
      note: ['']
    });
    const today = new Date().toISOString().slice(0, 10);
    this.form.patchValue({ date: today });
  }

  ngOnInit() {
    this.activeMonth = this.transactionService.getActiveMonth() ?? '';
    this.updateMonthBounds();
    if (!this.editingId && this.activeMonth) {
      this.form.patchValue({ date: this.getDefaultDateForMonth(this.activeMonth) });
    }

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        const existing = this.transactionService.getById(id);
        if (existing) {
          this.mode = 'Edit';
          this.editingId = id;
          this.type = existing.type;
          this.amountDisplay = existing.amount.toFixed(2).replace(/\.00$/, '');
          this.form.patchValue({
            amount: existing.amount,
            type: existing.type,
            category: existing.category,
            date: existing.date.substring(0, 10),
            note: existing.note || '',
          });
        }
      }
    });
  }

  setType(type: 'income' | 'expense') {
    this.type = type;
    this.form.patchValue({ type, category: '' });
  }

  updateCustomCategory(value: string) {
    const normalizedValue = value.trim();
    this.form.patchValue({ category: normalizedValue });
    this.form.get('category')?.markAsTouched();
  }

  appendNumber(value: string) {
    if (value === '.' && this.amountDisplay.includes('.')) return;
    if (this.amountDisplay === '0' && value !== '.') {
      this.amountDisplay = value;
    } else {
      if (this.amountDisplay.includes('.')) {
        const parts = this.amountDisplay.split('.');
        if (parts[1].length >= 2) return;
      }
      if (this.amountDisplay.length >= 9) return;
      this.amountDisplay += value;
    }
    this.syncAmount();
  }

  deleteNumber() {
    if (this.amountDisplay.length > 1) {
      this.amountDisplay = this.amountDisplay.slice(0, -1);
    } else {
      this.amountDisplay = '0';
    }
    this.syncAmount();
  }

  private syncAmount() {
    const normalized = this.amountDisplay === '' ? '0' : this.amountDisplay;
    this.form.patchValue({ amount: normalized });
  }

  private getDefaultDateForMonth(month: string): string {
    return `${month}-01`;
  }

  private getDaysInMonth(month: string): number {
    const [year, monthNumber] = month.split('-').map(Number);
    return new Date(year, monthNumber, 0).getDate();
  }

  private updateMonthBounds(): void {
    if (!this.activeMonth) {
      this.minDate = '';
      this.maxDate = '';
      return;
    }
    const days = this.getDaysInMonth(this.activeMonth);
    this.minDate = `${this.activeMonth}-01`;
    this.maxDate = `${this.activeMonth}-${String(days).padStart(2, '0')}`;
  }

  private isDateInActiveMonth(dateValue: string): boolean {
    return !this.activeMonth || dateValue.startsWith(this.activeMonth);
  }

  openDatePicker(): void {
    this.datePickerOpen = true;
  }

  onDateSelected(date: string): void {
    if (date) {
      if (!this.isDateInActiveMonth(date)) {
        this.activeMonthWarning = `Date must be within ${this.activeMonth}.`;
        this.datePickerOpen = false;
        return;
      }
      this.activeMonthWarning = '';
      this.form.patchValue({ date });
      this.form.get('date')?.markAsTouched();
    }
    this.datePickerOpen = false;
  }

  onDatePickerClosed(): void {
    this.datePickerOpen = false;
  }

  submit() {
    if (!this.editingId && !this.activeMonth) {
      this.activeMonthWarning = 'Select and start a month from the dashboard before adding new transactions.';
      return;
    }

    if (this.form.valid) {
      const formValue = this.form.value;
      const txData = {
        amount: parseFloat(formValue.amount),
        type: formValue.type,
        category: formValue.category,
        date: formValue.date,
        note: formValue.note || ''
      };

      if (!this.isDateInActiveMonth(txData.date)) {
        this.activeMonthWarning = `Date must be within ${this.activeMonth}.`;
        return;
      }

      this.activeMonthWarning = '';
      if (this.editingId) {
        this.transactionService.update(this.editingId, txData);
      } else {
        this.transactionService.add(txData);
      }
      this.router.navigate(['/']);
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancel() {
    this.router.navigate(['/']);
  }
}
