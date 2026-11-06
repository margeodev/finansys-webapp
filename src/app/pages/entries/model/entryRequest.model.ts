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

export interface EntryUpdateRequest {
    description: string;
    amount: number;
    categoryId: number;
    date: string; // 'YYYY-MM-DD'
    isPersonal: boolean;
}
