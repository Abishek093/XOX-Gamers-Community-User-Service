// UserSignupDTO.ts

export class UserSignupDTO {
    constructor(
        public username: string,
        public email: string,
        public displayName: string,
        public password: string,
        public birthDate: Date,
    ) {}
}
