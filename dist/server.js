"use strict";
// import dotenv from 'dotenv'
// dotenv.config()
// import express, { NextFunction, Request, Response } from 'express'
// import { createServer } from 'http'
// import UserRouter from './routes/UserRoutes'
// import connectDB from './frameworks-and-drivers/database/db'
// import cors from 'cors';
// import CustomError from './utils/CustomError'
// import { handleResponse } from './utils/ResponseHandler'
// import { ErrorRequestHandler } from 'express';
// import fs from 'fs';
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
// const app = express()
// const server = createServer(app)
// const PORT = process.env.PORT || 3000
// // app.use(cors({
// //     origin: 'http://localhost:3001',
// //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
// //     allowedHeaders: ['Content-Type', 'Authorization'],
// // }));
// // app.use(cors({
// //     origin: (origin, callback) => {
// //         const allowedOrigins = ['http://localhost:3001', 'http://localhost:5173'];
// //         if (!origin || allowedOrigins.includes(origin)) {
// //             callback(null, true);  // Allow the request if the origin is in the allowed list
// //         } else {
// //             console.log("Not allowed by CORS")
// //             callback(new Error('Not allowed by CORS'));  // Block the request if the origin is not allowed
// //         }
// //     },
// //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
// //     allowedHeaders: ['Content-Type', 'Authorization'],
// // }));
// app.use(cors({
//     origin: (origin, callback) => {
//         const allowedOrigins = ['http://localhost:3001', 'http://localhost:5173'];
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true
// }));
// app.use(express.json());
// app.use('/api/user',UserRouter)
// function logErrorToFile(err: CustomError) {
//     const log = `
//     ===============================
//     Date: ${new Date().toISOString()}
//     Status Code: ${err.statusCode}
//     Error Message: ${err.message}
//     Stack Trace: ${err.stack}  // This includes file and line numbers
//     ===============================\n\n`;
//     // Log to file
//     fs.appendFile('server-errors.log', log, (error) => {
//         if (error) console.error('Failed to write error log', error);
//     });
//     // Log to console
//     console.error(log);
// }
// app.use(((err: CustomError, req, res, next) => {
//     const statusCode = err.statusCode || 500;
//     if (statusCode >= 400 && statusCode < 500) {
//         console.log("if condition in server", err.message)
//         handleResponse(res, statusCode, err.message); // Send user-friendly message
//     } else if (statusCode >= 500) {
//         logErrorToFile(err);  // Log detailed error including stack trace
//         handleResponse(res, statusCode, 'Something went wrong, please try again later.');
//     }
// }) as ErrorRequestHandler);
// connectDB().then(() => {
//     server.listen(PORT, () => {
//         console.log(`User service server running on http://localhost:${PORT}`);
//     });
// });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const UserRoutes_1 = __importDefault(require("./routes/UserRoutes"));
const db_1 = __importDefault(require("./frameworks-and-drivers/database/db"));
const ResponseHandler_1 = require("./utils/ResponseHandler");
const fs_1 = __importDefault(require("fs"));
const queueService_1 = require("./services/queueService");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3000;
// CORS is now handled by Nginx, so we don't need it here
app.use(express_1.default.json());
app.use('/api/user', UserRoutes_1.default);
function logErrorToFile(err) {
    const log = `
    ===============================
    Date: ${new Date().toISOString()}
    Status Code: ${err.statusCode}
    Error Message: ${err.message}
    Stack Trace: ${err.stack}  // This includes file and line numbers
    ===============================\n\n`;
    // Log to file
    fs_1.default.appendFile('server-errors.log', log, (error) => {
        if (error)
            console.error('Failed to write error log', error);
    });
    // Log to console
    console.error(log);
}
app.use(((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    if (statusCode >= 400 && statusCode < 500) {
        console.log("if condition in server", err.message);
        (0, ResponseHandler_1.handleResponse)(res, statusCode, err.message); // Send user-friendly message
    }
    else if (statusCode >= 500) {
        logErrorToFile(err); // Log detailed error including stack trace
        (0, ResponseHandler_1.handleResponse)(res, statusCode, 'Something went wrong, please try again later.');
    }
}));
(0, db_1.default)().then(() => __awaiter(void 0, void 0, void 0, function* () {
    (0, queueService_1.startQueueConsumer)();
    server.listen(PORT, () => {
        console.log(`User service server running on http://localhost:${PORT}`);
    });
}));
