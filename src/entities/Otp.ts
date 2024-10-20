export class Otp{
    constructor(
        public readonly otp: number,
        public readonly userId: String,
        public readonly createdAt: Date,
    ) {}
}