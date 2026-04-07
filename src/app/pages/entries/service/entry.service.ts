import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { BalanceResponse } from '../model/balance.model';
import { Entry } from '../model/entry.model';
import { EntryRequest } from '../model/entryRequest.model';

@Injectable({
  providedIn: 'root'
})
export class EntryService {
  private apiUrl: string = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  create(entry: EntryRequest): Observable<Entry | Entry[]> {
    const payload: any = {
      description: entry.description,
      amount: Number(entry.amount),
      date: entry.date ?? new Date().toISOString().split('T')[0],
      categoryId: entry.categoryId,
      isAdvancePayment: entry.advancePayment ?? false,
      isPersonal: entry.isPersonal ?? false,
      userId: entry.userId ?? null,
      ...(entry.recurrence ? { recurrence: entry.recurrence } : {}),
    };

    return this.http.post<any>(this.apiUrl, payload).pipe(
      catchError(this.handleError),
      map((data) => Array.isArray(data) ? data.map(d => this.jsonToEntry(d)) : this.jsonToEntry(data))
    );
  }

  getByUserAndMonth(userId: number, date?: string, isPersonal: boolean = false): Observable<Entry[]> {
    let params = new HttpParams();
    params = params.set('isActive', 'true');
    params = params.set('userId', String(userId));
    if (date) {
      params = params.set('date', date);
    }

    return this.http.get<Entry[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError),
      map((data) => this.jsonDataToEntries(data))
    );
  }

  getUserTotal(userId: number, date?: string): Observable<BalanceResponse> {
    let params = new HttpParams();
    params = params.set('isActive', 'true');
    params = params.set('userId', String(userId));
    if (date) {
      params = params.set('date', date);
    }

    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map(expenses => {
        let subTotal = 0;
        let totalAdvance = 0;
        expenses.forEach(e => {
          const amount = Number(e.amount) || 0;
          subTotal += amount;
          if (e.isAdvancePayment) {
            totalAdvance += amount;
          }
        });
        const halfAdvance = totalAdvance / 2;
        const adjustedSubTotal = subTotal - halfAdvance;
        return new BalanceResponse(adjustedSubTotal, totalAdvance);
      }),
      catchError(this.handleError)
    );
  }

  computeBalance(entries: Entry[]): BalanceResponse {
    let subTotal = 0;
    let totalAdvance = 0;
    entries.forEach(e => {
      const amount = Number(e.amount) || 0;
      subTotal += amount;
      if (e.advancePayment) totalAdvance += amount;
    });
    const halfAdvance = totalAdvance / 2;
    return new BalanceResponse(subTotal - halfAdvance, totalAdvance);
  }

  update(id: string, entry: Entry, updateAll: boolean = false): Observable<Entry> {
    const url = updateAll ? `${this.apiUrl}/${id}?updateAll=true` : `${this.apiUrl}/${id}`;
    const payload = { isAdvancePayment: entry.advancePayment };
    return this.http.patch<Entry>(url, payload).pipe(
      catchError(this.handleError),
      map((data) => this.jsonToEntry(data))
    );
  }

  delete(id: string, cascade: boolean = false): Observable<void> {
    const url = cascade ? `${this.apiUrl}/${id}?cascade=true` : `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(catchError(this.handleError));
  }

  private jsonDataToEntries(jsonData: any[]): Entry[] {
    return jsonData.map(element => this.jsonToEntry(element));
  }

  private jsonToEntry(jsonData: any): Entry {
    const e: Entry = {
      id: jsonData.id,
      description: jsonData.description,
      amount: String(jsonData.amount),
      advancePayment: jsonData.isAdvancePayment,
      isPersonal: jsonData.isPersonal,
      category: {
        id: Number(jsonData.categoryId),
        description: jsonData.categoryDescription || ''
      },
      recurrenceRuleId: jsonData.recurrenceRuleId ?? null,
      installmentNumber: jsonData.installmentNumber ?? null,
      recurrenceRule: jsonData.recurrenceRule ?? null,
    } as Entry;
    (e as any).date = jsonData.date;
    return e;
  }

  private handleError(error: any): Observable<any> {
    return throwError(error);
  }
}
