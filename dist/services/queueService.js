"use strict";
// import { consumeQueue } from "./RabbitMQConsumer";
// // import { createUser, updateProfile, updateProfileImage } from "../application/UserManagementUseCases";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startQueueConsumer = void 0;
// export const startQueueConsumer = () => {
//   consumeQueue('user-service-block-user', UserInteractor. );
// //   consumeQueue('chat-service-update-profile-image', updateProfileImage)
// //   consumeQueue('chat-service-update-profile', updateProfile)
// };  
const RabbitMQConsumer_1 = require("./RabbitMQConsumer");
const UserRepository_1 = require("../repositories/UserRepository");
const UserInteractor_1 = require("../interactors/UserInteractor");
const mailer_1 = require("../external-libraries/mailer");
const messageBroker_1 = require("../external-libraries/messageBroker");
const ProfileInteractor_1 = require("../interactors/ProfileInteractor");
const ProfileRepository_1 = require("../repositories/ProfileRepository");
const startQueueConsumer = () => {
    const mailer = new mailer_1.Mailer();
    const broker = new messageBroker_1.MessageBroker();
    const userRepository = new UserRepository_1.UserRepository();
    const profileRepository = new ProfileRepository_1.ProfileRepository();
    const userInteractor = new UserInteractor_1.UserInteractor(userRepository, mailer, broker);
    const profileInteractor = new ProfileInteractor_1.ProfileInteractor(userRepository, profileRepository, broker);
    (0, RabbitMQConsumer_1.consumeQueue)('user-service-block-user', (userData) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log('userData', userData);
            yield userInteractor.blockUnblockUser(userData.id, userData.isBlocked);
            // await userInteractor.createUser(userData);
        }
        catch (error) {
            console.error("Failed to create user:", error);
        }
    }));
};
exports.startQueueConsumer = startQueueConsumer;
