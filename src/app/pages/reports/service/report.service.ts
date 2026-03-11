import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';
import { ReportModel } from '../model/report.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private apiUrl: string = `${environment.apiUrl}/api/v1/reports`;

  constructor(private http: HttpClient) { }

  getByMonth(monthsBack: string): Observable<ReportModel[]> {
    const params = new HttpParams().set('monthsBack', monthsBack);
    return this.http.get<ReportModel[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError),
      map(this.jsonDataToReport)
    );
  }

  getLastNMonths(n: number, offset: number = 0): Observable<ReportModel[][]> {
    const calls = Array.from({ length: n }, (_, i) =>
      this.getByMonth(String(offset + i)).pipe(catchError(() => of([])))
    );
    return forkJoin(calls);
  }

  private jsonDataToReport(jsonData: any[]): ReportModel[] {
    return jsonData.map(element => element as ReportModel);
  }

  private handleError(error: any): Observable<any> {
    return throwError(error);
  }
}
