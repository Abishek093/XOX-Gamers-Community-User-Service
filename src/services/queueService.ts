// import { consumeQueue } from "./RabbitMQConsumer";
// // import { createUser, updateProfile, updateProfileImage } from "../application/UserManagementUseCases";

// export const startQueueConsumer = () => {
//   consumeQueue('user-service-block-user', UserInteractor. );
// //   consumeQueue('chat-service-update-profile-image', updateProfileImage)
// //   consumeQueue('chat-service-update-profile', updateProfile)
// };  
import { consumeQueue } from "./RabbitMQConsumer";
import { UserRepository } from "../repositories/UserRepository";
import { UserInteractor } from "../interactors/UserInteractor";
import { Mailer } from "../external-libraries/mailer";
import { MessageBroker } from "../external-libraries/messageBroker";
import { ProfileInteractor } from "../interactors/ProfileInteractor";
import { ProfileRepository } from "../repositories/ProfileRepository";


export const startQueueConsumer = () => {
    const mailer = new Mailer()
    const broker = new MessageBroker()
    const userRepository = new UserRepository();
    const profileRepository = new ProfileRepository()
    const userInteractor = new UserInteractor(userRepository, mailer, broker);
    const profileInteractor = new ProfileInteractor(userRepository, profileRepository, broker)


    consumeQueue('user-service-block-user', async (userData) => {
        try {
            console.log('userData', userData)
            await userInteractor.blockUnblockUser(userData.id, userData.isBlocked)
            // await userInteractor.createUser(userData);
        } catch (error) {
            console.error("Failed to create user:", error);
        }
    });

}