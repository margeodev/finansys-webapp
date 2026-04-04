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
  private apiUrl: string = `${environment.apiUrl}/expenses`;

  private readonly CATEGORY_LABELS: Record<string, string> = {
    '1': 'Moradia',
    '2': 'Mercado',
    '3': 'Contas (água, luz, internet)',
    '4': 'Transporte',
    '5': 'Lazer',
    '6': 'Saúde',
    '7': 'Restaurantes / Comida fora',
    '8': 'Manutenção / Reforma',
    '9': 'Padaria',
    '10': 'Farmácia',
    '11': 'Outros',
    '12': 'Pet',
    '13': 'Carro',
  };

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
      map((data) => this.jsonToEntry(data))
    );
  }

  getByUserAndMonth(userId: string, date?: string, isPersonal: boolean = false): Observable<Entry[]> {
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

  getUserTotal(userId: string, date?: string): Observable<BalanceResponse> {
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

  update(id: string, entry: Entry): Observable<Entry> {
    const url = `${this.apiUrl}/${id}`;
    const payload = { isAdvancePayment: entry.advancePayment };
    return this.http.patch<Entry>(url, payload).pipe(
      catchError(this.handleError),
      map((data) => this.jsonToEntry(data))
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
        isPersonal: element.isPersonal,
        category: {
          id: element.categoryId,
          description: element.categoryDescription || this.CATEGORY_LABELS[element.categoryId] || ''
        }
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
      isPersonal: jsonData.isPersonal,
      category: {
        id: jsonData.categoryId,
        description: jsonData.categoryDescription || this.CATEGORY_LABELS[jsonData.categoryId] || ''
      }
    } as Entry;
    (e as any).date = jsonData.date;
    return e;
  }

  private handleError(error: any): Observable<any> {
    return throwError(error);
  }
}
