import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntryEventsService {
  private entryCreatedSource = new Subject<void>();
  entryCreated$ = this.entryCreatedSource.asObservable();

  private dialogStateSource = new Subject<boolean>();
  dialogState$ = this.dialogStateSource.asObservable();

  private entryUpdatedSource = new Subject<void>();
  entryUpdated$ = this.entryUpdatedSource.asObservable();

  notifyEntryCreated(): void {
    this.entryCreatedSource.next();
  }

  // 🚀 controla abertura/fechamento do diálogo
  setDialogState(isOpen: boolean): void {
    this.dialogStateSource.next(isOpen);
  }

  notifyEntryUpdated(): void {
    this.entryUpdatedSource.next();
  }
  
}
