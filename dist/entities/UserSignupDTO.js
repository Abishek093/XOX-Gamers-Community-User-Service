"use strict";
// UserSignupDTO.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSignupDTO = void 0;
class UserSignupDTO {
    constructor(username, email, displayName, password, birthDate) {
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.password = password;
        this.birthDate = birthDate;
    }
}
exports.UserSignupDTO = UserSignupDTO;
