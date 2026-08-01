import { Injectable } from '@angular/core';
import { TransactionService } from './transaction.service';

export interface EmiItem {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
}

export interface RecurringSettings {
  salary: number;
  emiItems: EmiItem[];
  appliedMonths?: string[];
}

const STORAGE_KEY = 'my_expenses_recurring_settings_v1';

@Injectable({ providedIn: 'root' })
export class RecurringService {
  private settings: RecurringSettings = {
    salary: 0,
    emiItems: [],
  };

  constructor() {
    this.load();
  }

  getSettings(): RecurringSettings {
    return {
      salary: this.settings.salary,
      emiItems: [...this.settings.emiItems],
      appliedMonths: Array.isArray(this.settings.appliedMonths) ? [...this.settings.appliedMonths] : [],
    };
  }

  saveSettings(settings: RecurringSettings): void {
    this.settings = {
      salary: settings.salary,
      emiItems: settings.emiItems.map((item) => ({ ...item })),
      appliedMonths: Array.isArray(settings.appliedMonths) ? [...settings.appliedMonths] : [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
  }

  ensureRecurringTransactions(transactionService: TransactionService, targetMonth?: string): boolean {
    const monthKey = targetMonth ?? this.monthKey(new Date());
    const appliedMonths = Array.isArray(this.settings.appliedMonths) ? this.settings.appliedMonths : [];
    if (appliedMonths.includes(monthKey)) {
      return false;
    }

    const [year, month] = monthKey.split('-').map(Number);
    const currentDate = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0).getDate();

    if (this.settings.salary > 0) {
      const salaryDate = new Date(year, month - 1, 1);
      const salaryDateString = salaryDate.toISOString().slice(0, 10);
      transactionService.add({
        amount: this.settings.salary,
        type: 'income',
        category: 'Salary',
        date: salaryDateString,
        note: 'Monthly Salary',
        recurringId: 'salary',
      });
    }

    this.settings.emiItems
      .filter((item) => item.amount > 0)
      .forEach((item) => {
        const dueDate = new Date(item.dueDate);
        const day = isNaN(dueDate.getDate()) ? 1 : Math.min(dueDate.getDate(), lastDay);
        const recurringDate = new Date(year, month - 1, day);
        const recurringDateString = recurringDate.toISOString().slice(0, 10);

        transactionService.add({
          amount: item.amount,
          type: 'expense',
          category: item.name || 'Recurring EMI',
          date: recurringDateString,
          note: 'Recurring EMI',
          recurringId: item.id,
        });
      });

    this.settings.appliedMonths = [...appliedMonths, monthKey];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    return true;
  }

  private load(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as RecurringSettings;
      const today = new Date().toISOString().slice(0, 10);
      const appliedMonths = Array.isArray(parsed.appliedMonths)
        ? parsed.appliedMonths
        : typeof (parsed as any).lastAppliedMonth === 'string' && (parsed as any).lastAppliedMonth
          ? [(parsed as any).lastAppliedMonth]
          : [];
      this.settings = {
        salary: parsed.salary ?? 0,
        emiItems: Array.isArray(parsed.emiItems) ? parsed.emiItems.map((item) => ({
          id: item.id ?? `emi-${Date.now()}`,
          name: item.name ?? '',
          amount: Number(item.amount) || 0,
          dueDate: typeof item.dueDate === 'string' && item.dueDate ? item.dueDate : today,
        })) : [],
        appliedMonths,
      };
    } catch {
      this.settings = { salary: 0, emiItems: [] };
    }
  }

  private monthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
