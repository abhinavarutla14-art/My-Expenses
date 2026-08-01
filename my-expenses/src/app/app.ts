import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TransactionService } from './services/transaction.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('my-expenses');
  constructor(private service: TransactionService) {}

  exportData() {
    const json = this.service.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = `expenses_export_${new Date().toISOString().slice(0,10)}.json`;
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  triggerImport() {
    const el = document.getElementById('import-file') as HTMLInputElement | null;
    el?.click();
  }

  async onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const ok = this.service.importAll(text);
      alert(ok ? 'Import successful' : 'Import failed');
    } catch (err) {
      alert('Import failed');
    }
    input.value = '';
  }

  archiveSnapshot() {
    const json = this.service.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = `expenses_snapshot_${new Date().toISOString().slice(0,10)}.json`;
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    alert('Snapshot downloaded');
  }
}
