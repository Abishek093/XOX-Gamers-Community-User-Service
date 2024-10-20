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



import dotenv from 'dotenv'
dotenv.config()
import express, { NextFunction, Request, Response } from 'express'
import { createServer } from 'http'
import UserRouter from './routes/UserRoutes'
import connectDB from './frameworks-and-drivers/database/db'
import CustomError from './utils/CustomError'
import { handleResponse } from './utils/ResponseHandler'
import { ErrorRequestHandler } from 'express';
import fs from 'fs';

const app = express()
const server = createServer(app)

const PORT = process.env.PORT || 3000

// CORS is now handled by Nginx, so we don't need it here

app.use(express.json());

app.use('/api/user', UserRouter)

function logErrorToFile(err: CustomError) {
    const log = `
    ===============================
    Date: ${new Date().toISOString()}
    Status Code: ${err.statusCode}
    Error Message: ${err.message}
    Stack Trace: ${err.stack}  // This includes file and line numbers
    ===============================\n\n`;

    // Log to file
    fs.appendFile('server-errors.log', log, (error) => {
        if (error) console.error('Failed to write error log', error);
    });

    // Log to console
    console.error(log);
}

app.use(((err: CustomError, req, res, next) => {
    const statusCode = err.statusCode || 500;

    if (statusCode >= 400 && statusCode < 500) {
        console.log("if condition in server", err.message)
        handleResponse(res, statusCode, err.message); // Send user-friendly message
    } else if (statusCode >= 500) {
        logErrorToFile(err);  // Log detailed error including stack trace
        handleResponse(res, statusCode, 'Something went wrong, please try again later.');
    }
}) as ErrorRequestHandler);

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`User service server running on http://localhost:${PORT}`);
    });
});