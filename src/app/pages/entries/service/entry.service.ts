import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Entry } from '../model/entry.model';
import { EntryRequest } from '../model/entryRequest.model';
import { BalanceResponse } from '../model/balance.model';

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  private apiUrl: string = "/api/v1/entries";

  constructor(private http: HttpClient) { }

  getAll(): Observable<Entry[]> {
    return this.http.get(this.apiUrl).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntries)
    );
  }

  // delete(id: number): Observable<any> {
  //   const url = `${this.apiUrl}/${id}`;
  //   return this.http.delete(url).pipe(
  //     catchError(this.handleError),
  //     map(() => null)
  //   );
  // }

  create(entry: EntryRequest): Observable<EntryRequest> {
    return this.http.post<Entry>(this.apiUrl, entry).pipe(
      catchError(this.handleError),
      map(this.jsonToEntry)
    );
  }

  // getById(id: number): Observable<Entry> {
  //   const url = `${this.apiUrl}/${id}`;

  //   return this.http.get(url).pipe(
  //     catchError(this.handleError),
  //     map(this.jsonToEntry)
  //   );
  // }

  getByUserAndMonth(userName: string): Observable<Entry[]> {
    const url = `${this.apiUrl}/current-month`;

    const headers = new HttpHeaders({
      'userName': userName
    });

    return this.http.get<Entry[]>(url, { headers }).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntries)
    );
  }

  getUserTotal(userName: string): Observable<BalanceResponse> {
    const url = `${this.apiUrl}/total`;
    const headers = new HttpHeaders({
      'userName': userName
    });
    
    return this.http.get<BalanceResponse>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }


  update(id: number, entry: EntryRequest): Observable<Entry> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Entry>(url, entry).pipe(
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
