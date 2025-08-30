import { Category } from "../../categories/model/category.model";
import { User } from "../../login/model/user.model";

export class Entry {
    constructor(
        public id?: string,
        public description?: string,
        public category?: Category,
        public user?: User,
        public amount?: string
    ) {}
}