export class UserHeader {
    constructor(
        public id?: string,
        public userName?: string,
        public subtotal?: number,
        public advance?: number,
        public balance?: number,
        public totalShared?: number,
        public totalPersonal?: number
    ) {}
}