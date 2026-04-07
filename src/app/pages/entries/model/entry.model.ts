import { Category } from "../../categories/model/category.model";
import { User } from "../../login/model/user.model";

export interface RecurrenceRule {
  type: 'fixed' | 'installment';
  frequency: 'monthly' | 'weekly';
  totalInstallments: number | null;
}

export class Entry {
    constructor(
        public id?: string,
        public description?: string,
        public category?: Category,
        public user?: User,
        public amount?: string,
        public advancePayment?: boolean,
        public isPersonal?: boolean,
        public recurrenceRuleId?: string | null,
        public installmentNumber?: number | null,
        public recurrenceRule?: RecurrenceRule | null
    ) {}
}
