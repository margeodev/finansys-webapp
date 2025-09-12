export class UserHeader {
    constructor(
        public userName?: string,
        public subtotal?: number,
        public advance?: number,
        public balance?: number
    ) {}
}