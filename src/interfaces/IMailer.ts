export interface IMailer{
    SendMail(to: string, message:{subject: string, text: string}): Promise<void>;
}