import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'calendar-picker',
  imports: [CommonModule],
  template: `
    <div class="calendar-modal-overlay" *ngIf="isOpen" (click)="onBackdropClick()">
      <div class="calendar-modal" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="calendar-header">
          <div>
            <h2 class="calendar-title">{{ selectedDate | date:'MMMM, yyyy' }}</h2>
            <p class="calendar-subtitle">SELECT DATE</p>
          </div>
          <button class="close-btn" (click)="close()" type="button">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Month/Year Navigation -->
        <div class="month-nav-row">
          <button class="nav-btn" [disabled]="isPrevMonthDisabled()" (click)="prevMonth()" type="button">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <div class="year-display">
            <button class="year-btn" type="button">{{ selectedDate | date:'yyyy' }}</button>
          </div>
          <button class="nav-btn" (click)="nextMonth()" type="button">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-grid">
          <!-- Day Labels -->
          <div class="day-labels">
            <div *ngFor="let day of dayLabels" class="day-label">{{ day }}</div>
          </div>

          <!-- Calendar Days -->
          <div class="calendar-days">
            <!-- Empty slots for days before month starts -->
            <div *ngFor="let _ of emptyDays" class="empty-day"></div>

            <!-- Days of month -->
            <button
              *ngFor="let day of daysInMonth"
              [class.today]="isToday(day)"
              [class.selected]="isSelected(day)"
              (click)="selectDay(day)"
              type="button"
              class="calendar-day">
              {{ day }}
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-footer">
          <button class="action-btn clear-btn" (click)="clear()" type="button">CLEAR</button>
          <div class="action-right">
            <button class="action-btn cancel-btn" (click)="cancel()" type="button">CANCEL</button>
            <button class="action-btn apply-btn" (click)="apply()" type="button">APPLY</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      background-color: rgba(26, 28, 30, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .calendar-modal {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 32px rgba(15, 23, 42, 0.12);
      max-width: 360px;
      width: calc(100% - 32px);
      border: 1px solid #e2e8f0;
      animation: slideUp 0.3s ease-in-out;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .calendar-header {
      padding: 24px;
      border-bottom: 1px solid #e8e8ea;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .calendar-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      line-height: 28px;
      color: #0f172a;
    }

    .calendar-subtitle {
      margin: 4px 0 0 0;
      font-size: 12px;
      font-weight: 600;
      line-height: 16px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #003ec7;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .close-btn:hover {
      background-color: #f3f3f6;
    }

    .close-btn .material-symbols-outlined {
      font-size: 24px;
      color: #434656;
    }

    .month-nav-row {
      padding: 16px;
      background-color: #f3f3f6;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-btn {
      padding: 8px;
      border-radius: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: background-color 0.2s ease, opacity 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-btn:hover {
      background-color: #e8e8ea;
    }

    .nav-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: transparent;
    }

    .nav-btn .material-symbols-outlined {
      font-size: 24px;
      color: #0f172a;
    }

    .year-display {
      display: flex;
      gap: 8px;
    }

    .year-btn {
      padding: 6px 16px;
      border-radius: 8px;
      border: 1px solid #737688;
      background: #ffffff;
      color: #0f172a;
      font-size: 12px;
      font-weight: 600;
      line-height: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .year-btn:hover {
      background-color: #f3f3f6;
    }

    .calendar-grid {
      padding: 24px;
    }

    .day-labels {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      margin-bottom: 8px;
    }

    .day-label {
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      line-height: 16px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #737688;
    }

    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 0;
    }

    .empty-day {
      aspect-ratio: 1;
    }

    .calendar-day {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: #0f172a;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .calendar-day:hover {
      background-color: #e8e8ea;
    }

    .calendar-day.today {
      color: #003ec7;
      font-weight: 700;
      box-shadow: inset 0 0 0 2px #003ec7;
    }

    .calendar-day.selected {
      background-color: #0052ff;
      color: #ffffff;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(0, 82, 255, 0.25);
    }

    .calendar-day.selected:hover {
      opacity: 0.9;
    }

    .action-footer {
      padding: 24px;
      border-top: 1px solid #e8e8ea;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .action-right {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      line-height: 16px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .clear-btn {
      background: transparent;
      color: #434656;
    }

    .clear-btn:hover {
      background-color: #f3f3f6;
    }

    .cancel-btn {
      background: transparent;
      color: #003ec7;
    }

    .cancel-btn:hover {
      background-color: #dde1ff;
    }

    .apply-btn {
      background-color: #003ec7;
      color: #ffffff;
      box-shadow: 0 4px 8px rgba(0, 62, 199, 0.24);
    }

    .apply-btn:hover {
      opacity: 0.9;
    }

    .apply-btn:active {
      transform: scale(0.95);
    }
  `]
})
export class CalendarPicker implements OnInit {
  @Input() isOpen = false;
  @Input() selectedDateValue: string = '';
  @Output() dateSelected = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  selectedDate = new Date();
  daysInMonth: number[] = [];
  emptyDays: number[] = [];
  dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  tempSelectedDate: string = '';

  ngOnInit() {
    if (this.selectedDateValue) {
      this.selectedDate = new Date(this.selectedDateValue);
      this.tempSelectedDate = this.selectedDateValue;
    } else {
      this.tempSelectedDate = this.selectedDate.toISOString().slice(0, 10);
    }
    this.generateCalendar();
  }

  ngOnChanges() {
    if (this.selectedDateValue) {
      this.selectedDate = new Date(this.selectedDateValue);
      this.tempSelectedDate = this.selectedDateValue;
    }
    this.generateCalendar();
  }

  generateCalendar(): void {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1).getDay();
    // Days in month
    const daysCount = new Date(year, month + 1, 0).getDate();

    this.emptyDays = Array(firstDay).fill(0);
    this.daysInMonth = Array.from({ length: daysCount }, (_, i) => i + 1);
  }

  prevMonth(): void {
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const previousMonth = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() - 1, 1);

    if (previousMonth < currentMonth) {
      return;
    }

    this.selectedDate = previousMonth;
    this.generateCalendar();
  }

  nextMonth(): void {
    this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDay(day: number): void {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth();
    const date = new Date(year, month, day);
    this.tempSelectedDate = date.toISOString().slice(0, 10);
  }

  isPrevMonthDisabled(): boolean {
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const previousMonth = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() - 1, 1);
    return previousMonth < currentMonth;
  }

  isToday(day: number): boolean {
    const today = new Date();
    return (
      day === today.getDate() &&
      this.selectedDate.getMonth() === today.getMonth() &&
      this.selectedDate.getFullYear() === today.getFullYear()
    );
  }

  isSelected(day: number): boolean {
    if (!this.tempSelectedDate) return false;
    const year = this.selectedDate.getFullYear();
    const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return dateStr === this.tempSelectedDate;
  }

  apply(): void {
    this.dateSelected.emit(this.tempSelectedDate);
    this.closed.emit();
  }

  cancel(): void {
    this.closed.emit();
  }

  clear(): void {
    this.tempSelectedDate = '';
    this.dateSelected.emit('');
  }

  onBackdropClick(): void {
    this.closed.emit();
  }

  close(): void {
    this.closed.emit();
  }
}
