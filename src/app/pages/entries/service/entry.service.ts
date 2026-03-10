import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
  private apiUrl: string = `${environment.apiUrl}${environment.localApi}/v1/expenses`;

  constructor(private http: HttpClient) {}

  create(entry: EntryRequest): Observable<EntryRequest> {
    const payload: any = {
      description: entry.description,
      amount: Number(entry.amount),
      // usa data de hoje enquanto o backend não recebe outra data
      date: new Date().toISOString().split('T')[0],
      categoryId: entry.categoryId,
      isAdvancePayment: entry.advancePayment ?? false,
      isPersonal: entry.isPersonal ?? false,
      userId: entry.userId ?? null
    };

    return this.http.post<Entry>(this.apiUrl, payload).pipe(
      catchError(this.handleError),
      map(this.jsonToEntry)
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
      map(this.jsonDataToEntries)
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
        // Regra igual à API Java:
        // - subTotalBalance = soma de todas as despesas - metade do total de adiantamentos
        // - totalAdvanceBalance = soma total de adiantamentos
        const halfAdvance = totalAdvance / 2;
        const adjustedSubTotal = subTotal - halfAdvance;
        return new BalanceResponse(adjustedSubTotal, totalAdvance);
      }),
      catchError(this.handleError)
    );
  }

  update(id: string, entry: Entry): Observable<Entry> {
    const url = `${this.apiUrl}/${id}`;
    const payload = { isAdvancePayment: entry.advancePayment };
    return this.http.patch<Entry>(url, payload).pipe(
      catchError(this.handleError),
      map(this.jsonToEntry)
    );
  }

  private jsonDataToEntries(jsonData: any[]): Entry[] {
    const entries: Entry[] = [];
    jsonData.forEach(element => {
      const e: Entry = {
        id: element.id,
        description: element.description,
        amount: String(element.amount),
        advancePayment: element.isAdvancePayment,
        category: { id: element.categoryId, description: element.categoryDescription }
      } as Entry;
      (e as any).date = element.date;
      entries.push(e);
    });
    return entries;
  }

  private jsonToEntry(jsonData: any): Entry {
    const e: Entry = {
      id: jsonData.id,
      description: jsonData.description,
      amount: String(jsonData.amount),
      advancePayment: jsonData.isAdvancePayment,
      category: { id: jsonData.categoryId, description: jsonData.categoryDescription }
    } as Entry;
    (e as any).date = jsonData.date;
    return e;
  }

  private handleError(error: any): Observable<any> {
    return throwError(error);
  }
}
