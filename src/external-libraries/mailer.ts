import { IMailer } from "../interfaces/IMailer";
import nodemailer from 'nodemailer'
import dotenv from "dotenv"
dotenv.config()


export class Mailer implements IMailer {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  constructor() {
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Transporter configuration error:', error);
      } else {
        console.log('Transporter is configured correctly');
      }
    });
  }

  async SendMail(to: string, message:{subject: string, text: string}): Promise<void> {
    console.log("new opt is ", message.text)

    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: to,
      subject: message.subject,
      text: message.text
    };
  
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

}