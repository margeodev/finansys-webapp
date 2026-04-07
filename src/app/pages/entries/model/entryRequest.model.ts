export interface RecurrenceRequest {
  type: 'fixed' | 'installment';
  totalInstallments?: number;
}

export class EntryRequest {
    constructor(
        public description?: string,
        public amount?: string,
        public categoryId?: number,
        public advancePayment?: boolean,
        public isPersonal?: boolean,
        public userId?: number,
        public date?: string,
        public recurrence?: RecurrenceRequest | null
    ) {}
}
