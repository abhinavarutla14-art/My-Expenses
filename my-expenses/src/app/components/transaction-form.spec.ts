import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TransactionForm } from './transaction-form';
import { TransactionService } from '../services/transaction.service';

describe('TransactionForm', () => {
  let fixture: ComponentFixture<TransactionForm>;

  beforeEach(async () => {
    const transactionServiceStub = {
      getActiveMonth: () => '2026-08',
      getById: () => undefined,
      add: jasmine.createSpy('add'),
      update: jasmine.createSpy('update'),
    };

    await TestBed.configureTestingModule({
      imports: [TransactionForm, RouterTestingModule],
      providers: [
        { provide: TransactionService, useValue: transactionServiceStub },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionForm);
    fixture.detectChanges();
  });

  it('should allow entering a custom description for expense or income', () => {
    const input = fixture.nativeElement.querySelector('input[name="customDescription"]') as HTMLInputElement;

    expect(input).not.toBeNull();

    input.value = 'Movie ticket';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.form.get('category')?.value).toBe('Movie ticket');
  });
});
