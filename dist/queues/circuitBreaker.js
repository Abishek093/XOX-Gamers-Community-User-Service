"use strict";
// import CircuitBreaker from 'opossum';
// import { publishToQueue } from '../services/RabbitMQPublisher'; 
// const options = {
//   timeout: 5000, 
//   errorThresholdPercentage: 50, 
//   resetTimeout: 30000,
// };
// const circuitBreaker = new CircuitBreaker(async (message: any, queueName: string) => {
//   await publishToQueue(queueName, message);
// }, options);
// circuitBreaker.fallback((message: any, queueName: string) => {
//   console.error(`Fallback triggered for queue ${queueName}. Message:`, message);
// });
// export const publishUserCreationMessages = async (message: any) => {
//   const services = [
//     // 'admin-service-create-user',
//     'content-service-create-user',
//     // 'streaming-service-create-user',
//   ];
//   const results = await Promise.allSettled(
//     services.map((service) => circuitBreaker.fire(message, service))
//   );
//   results.forEach((result, index) => {
//     if (result.status === 'rejected') {
//       console.error(`Failed to notify ${services[index]}:`, result.reason);
//     }
//   });
// };
// export const publishProfileImageUpdateMessage = async (message: any) => {
//   return circuitBreaker.fire(message, 'chat-service-update-profile-image');
// };
// export const publishProfileUpdateMessage = async (message: any) => {
//   return circuitBreaker.fire(message, 'chat-service-update-profile');
// };
