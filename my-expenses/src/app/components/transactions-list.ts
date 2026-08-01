import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { TransactionService } from '../services/transaction.service';
import { Transaction } from '../models/transaction';
import { filter } from 'rxjs/operators';

interface TransactionGroup {
  label: string;
  items: Transaction[];
}

@Component({
  standalone: true,
  selector: 'transactions-list',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="transactions-page">
      <header class="transactions-topbar">
        <div class="topbar-start">
          <div class="avatar"></div>
          <div>
            <p class="eyebrow">My Expenses</p>
            <h1 class="page-title">Transactions</h1>
          </div>
        </div>
        <button class="icon-button" type="button" aria-label="Notifications">
          <span class="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main class="transactions-main">
        <section class="search-section">
          <div class="search-box">
            <span class="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              placeholder="Search transactions..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilters()"
              class="search-input"
            />
          </div>

          <div class="month-filter-row">
            <label for="monthFilter">Month</label>
            <select id="monthFilter" [(ngModel)]="monthFilter" (ngModelChange)="applyFilters()" class="month-select">
              <option value="">All months</option>
              <option *ngFor="let month of monthOptions" [value]="month.value">{{ month.label }}</option>
            </select>
          </div>

          <div class="filter-chips overflow-x-auto hide-scrollbar">
            <button
              type="button"
              class="chip"
              [class.active]="typeFilter === 'all'"
              (click)="setTypeFilter('all')"
            >
              All
            </button>
            <button
              type="button"
              class="chip"
              [class.active]="typeFilter === 'income'"
              (click)="setTypeFilter('income')"
            >
              Income
            </button>
            <button
              type="button"
              class="chip"
              [class.active]="typeFilter === 'expense'"
              (click)="setTypeFilter('expense')"
            >
              Expenses
            </button>
            <button
              type="button"
              class="chip"
              [class.active]="categoryMode"
              (click)="toggleCategoryMode()"
            >
              Categories
              <span class="material-symbols-outlined">expand_more</span>
            </button>
          </div>

          <div *ngIf="categoryMode" class="secondary-chips overflow-x-auto hide-scrollbar">
            <button
              type="button"
              class="chip"
              [class.active]="categoryFilter === ''"
              (click)="selectCategory('')"
            >
              All
            </button>
            <button
              *ngFor="let category of categories"
              type="button"
              class="chip"
              [class.active]="categoryFilter === category"
              (click)="selectCategory(category)"
            >
              {{ category }}
            </button>
          </div>
        </section>

        <section class="transaction-groups">
          <div *ngIf="groupedTransactions.length === 0" class="empty-state">
            No transactions found.
          </div>

          <div *ngFor="let group of groupedTransactions" class="group-section">
            <h2 class="group-label">{{ group.label }}</h2>
            <div class="group-list">
              <div *ngFor="let transaction of group.items" class="transaction-card">
                <button type="button" class="transaction-summary" (click)="toggleDetails(transaction.id)">
                  <div class="transaction-summary__left">
                    <div class="transaction-icon" [ngClass]="transaction.type === 'income' ? 'transaction-icon--income' : 'transaction-icon--expense'">
                      <span class="material-symbols-outlined">{{ transaction.type === 'income' ? 'payments' : 'shopping_cart' }}</span>
                    </div>
                    <div>
                      <p class="transaction-title">{{ transaction.category }}</p>
                      <p class="transaction-meta">{{ transaction.note || (transaction.type === 'income' ? 'Income' : 'Expense') }}</p>
                    </div>
                  </div>
                  <div class="transaction-amount">
                    <p [ngClass]="transaction.type === 'income' ? 'amount-positive' : 'amount-negative'">
                      {{ transaction.type === 'income' ? '+' : '-' }}₹{{ transaction.amount | number:'1.2-2' }}
                    </p>
                    <span class="material-symbols-outlined arrow-icon">chevron_right</span>
                  </div>
                </button>
                <div class="transaction-details" *ngIf="expandedIds.has(transaction.id)">
                  <div class="details-row">
                    <span class="details-label">Date</span>
                    <span>{{ transaction.date | date:'mediumDate' }}</span>
                  </div>
                  <div class="details-row">
                    <span class="details-label">Category</span>
                    <span>{{ transaction.category }}</span>
                  </div>
                  <div class="details-row">
                    <span class="details-label">Notes</span>
                    <span>{{ transaction.note || 'None' }}</span>
                  </div>
                  <div class="details-actions">
                    <button type="button" class="details-button" (click)="edit(transaction.id)">Edit</button>
                    <button type="button" class="details-button details-button--danger" (click)="delete(transaction.id)">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <nav class="bottom-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="bottom-nav__item">
          <span class="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </a>
        <a routerLink="/transactions" routerLinkActive="active" class="bottom-nav__item">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">receipt_long</span>
          <span>Transactions</span>
        </a>
        <a routerLink="/salary-setup" routerLinkActive="active" class="bottom-nav__item">
          <span class="material-symbols-outlined">calendar_today</span>
          <span>Recurring</span>
        </a>
      </nav>
    </section>
  `,
  styles: [`
    :host { display: block; background: #f9f9fc; min-height: 100vh; }
    .transactions-page { max-width: 640px; margin: 0 auto; padding: 1rem 0 5.5rem; }
    .transactions-topbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1rem 0; position: sticky; top: 0; background: #f9f9fc; z-index: 10; }
    .topbar-start { display: flex; align-items: center; gap: 1rem; }
    .avatar { width: 2.5rem; height: 2.5rem; border-radius: 9999px; overflow: hidden; border: 1px solid #e2e8f0; background: linear-gradient(135deg, #dbeafe, #c7d2fe); }
    .eyebrow { margin: 0 0 0.25rem; color: #64748b; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; }
    .page-title { margin: 0; font-size: 1.25rem; color: #0f172a; }
    .icon-button { width: 3rem; height: 3rem; border-radius: 1rem; border: 1px solid #e2e8f0; background: white; display: grid; place-items: center; cursor: pointer; }
    .transactions-main { padding: 1rem 1rem 0; }
    .search-section { display: grid; gap: 1rem; }
    .search-box { position: relative; }
    .search-input { width: 100%; padding: 0.95rem 1rem 0.95rem 3rem; border-radius: 1rem; border: none; background: #f2f4f8; color: #0f172a; font-size: 1rem; }
    .search-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12); }
    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    .month-filter-row { display: grid; gap: 0.5rem; }
    .month-filter-row label { color: #475569; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    .month-select { width: 100%; padding: 0.95rem 1rem; border-radius: 1rem; border: none; background: #f2f4f8; color: #0f172a; font-size: 1rem; }
    .filter-chips, .secondary-chips { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.25rem; }
    .chip { flex-shrink: 0; border: none; border-radius: 999px; padding: 0.8rem 1rem; background: #eef2ff; color: #334155; font-weight: 700; display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer; transition: transform 0.1s ease, background 0.2s ease; }
    .chip.active { background: #003ec7; color: #ffffff; }
    .chip:hover { transform: translateY(-1px); }
    .transaction-groups { display: grid; gap: 1.25rem; }
    .group-label { margin: 0; color: #64748b; font-size: 0.75rem; letter-spacing: 0.18em; text-transform: uppercase; }
    .group-list { display: grid; gap: 0.75rem; }
    .transaction-card { border-radius: 1.5rem; background: white; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06); }
    .transaction-summary { width: 100%; border: none; background: transparent; padding: 1rem; display: flex; justify-content: space-between; gap: 1rem; align-items: center; cursor: pointer; }
    .transaction-summary__left { display: flex; align-items: center; gap: 1rem; }
    .transaction-icon { width: 3rem; height: 3rem; border-radius: 1rem; display: grid; place-items: center; background: #eff6ff; color: #2563eb; }
    .transaction-icon--income { background: rgba(34, 197, 94, 0.12); color: #047857; }
    .transaction-icon--expense { background: rgba(248, 113, 113, 0.16); color: #b91c1c; }
    .transaction-title { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
    .transaction-meta { margin: 0.25rem 0 0; color: #64748b; font-size: 0.95rem; }
    .transaction-amount { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; }
    .amount-positive { color: #16a34a; font-weight: 700; }
    .amount-negative { color: #dc2626; font-weight: 700; }
    .arrow-icon { color: #94a3b8; }
    .transaction-details { padding: 1rem 1rem 1.25rem; background: #f8fafc; border-top: 1px solid #e2e8f0; display: grid; gap: 0.75rem; }
    .details-row { display: flex; justify-content: space-between; gap: 0.5rem; font-size: 0.95rem; color: #334155; }
    .details-label { color: #64748b; }
    .details-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .details-button { flex: 1; border: 1px solid #e2e8f0; background: white; color: #0f172a; border-radius: 1rem; padding: 0.85rem 1rem; font-weight: 700; cursor: pointer; }
    .details-button--danger { border-color: #fecaca; background: #fee2e2; color: #b91c1c; }
    .empty-state { padding: 1rem; text-align: center; color: #64748b; border-radius: 1.25rem; background: #f8fafc; }
    .bottom-nav { position: fixed; left: 0; right: 0; bottom: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; padding: 0.75rem 1rem 1rem; background: white; border-top: 1px solid #e2e8f0; z-index: 20; }
    .bottom-nav__item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.3rem; padding: 0.85rem; border-radius: 1rem; text-decoration: none; color: #64748b; font-size: 0.85rem; }
    .bottom-nav__item.active { background: #dde1ff; color: #003ec7; }
    @media (max-width: 640px) {
      .transactions-page { padding-bottom: 7rem; }
    }
  `]
})
export class TransactionsList implements OnDestroy {
  protected transactions: Transaction[] = [];
  protected groupedTransactions: TransactionGroup[] = [];
  protected categories: string[] = [];
  protected monthOptions: { value: string; label: string }[] = [];
  protected monthFilter = '';
  protected searchTerm = '';
  protected typeFilter: 'all' | 'income' | 'expense' = 'all';
  protected categoryFilter = '';
  protected categoryMode = false;
  protected expandedIds = new Set<string>();

  private sub: any;

  constructor(private router: Router, private service: TransactionService) {
    this.loadAllTransactions();
    this.sub = this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.loadAllTransactions());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe?.();
  }

  private loadAllTransactions(): void {
    const all = this.service.getAll();
    this.transactions = all;
    this.categories = Array.from(new Set(all.map((tx) => tx.category))).sort();
    this.monthOptions = Array.from(
      new Set(
        all
          .map((tx) => tx.date.slice(0, 7))
          .filter((value) => value)
      )
    )
      .sort((a, b) => b.localeCompare(a))
      .map((value) => ({
        value,
        label: new Date(value + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      }));
    this.applyFilters();
  }

  protected setTypeFilter(filter: 'all' | 'income' | 'expense'): void {
    this.typeFilter = filter;
    this.applyFilters();
  }

  protected toggleCategoryMode(): void {
    this.categoryMode = !this.categoryMode;
  }

  protected selectCategory(category: string): void {
    this.categoryFilter = category;
    this.applyFilters();
  }

  protected toggleDetails(id: string): void {
    if (this.expandedIds.has(id)) {
      this.expandedIds.delete(id);
    } else {
      this.expandedIds.add(id);
    }
  }

  protected edit(id: string): void {
    this.router.navigate(['/edit', id]);
  }

  protected delete(id: string): void {
    if (!confirm('Delete transaction?')) {
      return;
    }
    this.service.delete(id);
    this.loadAllTransactions();
  }

  protected applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();
    const filtered = this.transactions.filter((tx) => {
      if (this.typeFilter !== 'all' && tx.type !== this.typeFilter) {
        return false;
      }
      if (this.categoryFilter && tx.category !== this.categoryFilter) {
        return false;
      }
      if (this.monthFilter) {
        const txMonth = tx.date.slice(0, 7);
        if (txMonth !== this.monthFilter) {
          return false;
        }
      }
      if (!search) {
        return true;
      }
      return (
        tx.category.toLowerCase().includes(search) ||
        (tx.note ?? '').toLowerCase().includes(search) ||
        tx.type.toLowerCase().includes(search)
      );
    });
    this.groupedTransactions = this.groupByDate(filtered);
  }

  private groupByDate(items: Transaction[]): TransactionGroup[] {
    const groups = new Map<string, Transaction[]>();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const getLabel = (dateStr: string): string => {
      const date = new Date(dateStr);
      if (this.sameDay(date, today)) {
        return 'Today';
      }
      if (this.sameDay(date, yesterday)) {
        return 'Yesterday';
      }
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    items.forEach((item) => {
      const label = getLabel(item.date);
      if (!groups.has(label)) {
        groups.set(label, []);
      }
      groups.get(label)!.push(item);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([label, items]) => ({
        label,
        items: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      }));
  }

  private sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}
