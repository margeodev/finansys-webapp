export class EntryRequest {
    constructor(
        public description?: string,
        public amount?: string,
        public categoryId?: string
    ) {}
}