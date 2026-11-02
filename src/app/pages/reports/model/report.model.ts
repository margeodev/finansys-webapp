export class ReportModel {
    constructor(
        public id?: string,
        public categoryDescription?: string,
        public month?: string,
        public total?: number
    ) {}
}

export interface CategoryMonth {
    month: string; // 'YYYY-MM'
    total: number;
    entries: number;
}

export interface CategoryMonthlyReport {
    categoryId: number;
    categoryDescription: string | null;
    total: number;
    average: number;
    peak: CategoryMonth | null;
    months: CategoryMonth[];
}
