import { Injectable } from '@angular/core';

export type ToastType = 'info' | 'success' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts: Toast[] = [];
  private nextId = 1;

  get toasts() {
    return this._toasts;
  }

  show(message: string, type: ToastType = 'info', duration = 4000) {
    const t: Toast = { id: this.nextId++, message, type };
    this._toasts.push(t);
    if (duration > 0) {
      setTimeout(() => this.dismiss(t.id), duration);
    }
  }

  dismiss(id: number) {
    this._toasts = this._toasts.filter((t) => t.id !== id);
  }

  clear() {
    this._toasts = [];
  }
}
