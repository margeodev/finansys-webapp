import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SelectedMonthService {
  private subject = new BehaviorSubject<Date | null>(null);
  selectedMonth$ = this.subject.asObservable();

  setSelectedMonth(date: Date | null) {
    this.subject.next(date);
  }

  getSnapshot(): Date | null {
    return this.subject.value;
  }
}
