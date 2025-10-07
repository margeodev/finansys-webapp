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
  private apiUrl: string = `${environment.apiUrl}/api/v1/expenses`;

  constructor(private http: HttpClient) {}

  create(entry: EntryRequest): Observable<EntryRequest> {
    return this.http.post<Entry>(this.apiUrl, entry).pipe(
      catchError(this.handleError),
      map(this.jsonToEntry)
    );
  }

  // 👇 ALTERAÇÃO AQUI: Adicionado o parâmetro 'isPersonal'
  getByUserAndMonth(userName: string, date?: string, isPersonal: boolean = false): Observable<Entry[]> {
    const url = `${this.apiUrl}/period`;

    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    // Adiciona o novo parâmetro na requisição
    params = params.set('isPersonal', isPersonal.toString());

    const headers = new HttpHeaders({ 'userName': userName });

    return this.http.get<Entry[]>(url, { headers, params }).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntries)
    );
  }

  getUserTotal(userName: string, date?: string): Observable<BalanceResponse> {
    const url = `${this.apiUrl}/total`;

    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }

    const headers = new HttpHeaders({ 'userName': userName });

    return this.http.get<BalanceResponse>(url, { headers, params }).pipe(
      catchError(this.handleError)
    );
  }

  update(id: string, entry: Entry): Observable<Entry> {
    const url = `${this.apiUrl}/${id}/advance-payment`;
    return this.http.patch<Entry>(url, entry.advancePayment).pipe(
      catchError(this.handleError),
      map(this.jsonToEntry)
    );
  }

  private jsonDataToEntries(jsonData: any[]): Entry[] {
    const categories: Entry[] = [];
    jsonData.forEach(element => categories.push(element as Entry));
    return categories;
  }

  private jsonToEntry(jsonData: any): Entry {
    return jsonData as Entry;
  }

  private handleError(error: any): Observable<any> {
    return throwError(error);
  }
}
