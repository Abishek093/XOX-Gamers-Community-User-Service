"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBroker = void 0;
const opossum_1 = __importDefault(require("opossum"));
const RabbitMQPublisher_1 = require("../services/RabbitMQPublisher");
const circuitBreakerOptions = {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
};
class MessageBroker {
    constructor() {
        this.circuitBreaker = new opossum_1.default((message, queueName) => __awaiter(this, void 0, void 0, function* () {
            yield (0, RabbitMQPublisher_1.publishToQueue)(queueName, message);
        }), circuitBreakerOptions);
        this.circuitBreaker.fallback((message, queueName) => {
            console.error(`Fallback triggered for queue ${queueName}. Message:`, message);
        });
    }
    publishUserCreationMessage(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = {
                userId: userData.userId,
                username: userData.username,
                displayName: userData.displayName,
                profileImage: userData.profileImage,
                isBlocked: userData.isBlocked
            };
            yield this.circuitBreaker.fire(message, 'content-service-create-user');
        });
    }
    publishProfileUpdateMessage(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.circuitBreaker.fire(userData, 'content-service-update-user');
        });
    }
    publishProfileImageUpdateMessage(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.circuitBreaker.fire(userData, 'content-service-update-profile-image');
        });
    }
    PublishUserCreationMessageAdminServices(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.circuitBreaker.fire(userData, 'admin-service-create-user');
        });
    }
    publishStreamingServiceUserCreation(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.circuitBreaker.fire(userData, 'streaming-service-create-user');
        });
    }
}
exports.MessageBroker = MessageBroker;
