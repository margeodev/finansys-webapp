import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ReportModel } from '../model/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private apiUrl: string = "/api/v1/reports";

  constructor(private http: HttpClient) { }

  getByMonth(month: string): Observable<ReportModel[]> {
    const params = new HttpParams().set('monthsBack', month);

    return this.http.get<ReportModel[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError),
      map(this.jsonDataToReport)
    );
  }

  private jsonDataToReport(jsonData: any[]): ReportModel[]{    
    const reports: ReportModel[] = [];
    jsonData.forEach(element => reports.push(element as ReportModel));    
    return reports;
  }

  private handleError(error: any): Observable<any>{
    return throwError(error);
  }

}
