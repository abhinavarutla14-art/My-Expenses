import { Injectable } from '@angular/core';
import { Transaction } from '../models/transaction';
import { RecurringService } from './recurring.service';

const STORAGE_KEY = 'my_expenses_data_v1';
const ACTIVE_MONTH_KEY = 'my_expenses_active_month_v1';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private data: Transaction[] = [];
  private activeMonth?: string;

  constructor(private recurringService: RecurringService) {
    this.load();
    this.loadActiveMonth();
    this.recurringService.ensureRecurringTransactions(this);
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  private load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    this.data = raw ? JSON.parse(raw) : [];
  }

  getAll(): Transaction[] {
    return [...this.data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getActiveMonth(): string | null {
    return this.activeMonth ?? null;
  }

  setActiveMonth(month: string): void {
    this.activeMonth = month;
    localStorage.setItem(ACTIVE_MONTH_KEY, month);
  }

  private loadActiveMonth(): void {
    const raw = localStorage.getItem(ACTIVE_MONTH_KEY);
    this.activeMonth = raw || undefined;
  }

  getById(id: string): Transaction | undefined {
    return this.data.find((t) => t.id === id);
  }

  add(tx: Omit<Transaction, 'id'>) {
    const id = String(Date.now());
    const item: Transaction = { id, ...tx };
    this.data.push(item);
    this.save();
    return item;
  }

  applyRecurringTransactions(targetMonth?: string): boolean {
    return this.recurringService.ensureRecurringTransactions(this, targetMonth);
  }

  update(id: string, patch: Partial<Transaction>) {
    const idx = this.data.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.data[idx] = { ...this.data[idx], ...patch };
    this.save();
    return this.data[idx];
  }

  delete(id: string) {
    this.data = this.data.filter((t) => t.id !== id);
    this.save();
  }

  exportAll(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importAll(json: string) {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        this.data = parsed;
        this.save();
        return true;
      }
    } catch (e) {
      /* noop */
    }
    return false;
  }

  clear() {
    this.data = [];
    this.save();
  }
}
