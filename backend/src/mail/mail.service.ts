import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer'
import { from, lastValueFrom } from 'rxjs'
import { retry, delay } from 'rxjs/operators'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)

  constructor(private readonly mailer: MailerService) {}

  private getEmailsList() {
    const emailsList: string[] = process.env.SMTP_TO?.split(',') || []

    if (!emailsList || emailsList.length === 0) {
      throw new Error(`No recipients found in SMTP_TO env var, please check your .env file`)
    }

    return emailsList
  }

  private async sendEmail(
    userEmail: string,
    subject: string,
    userName: string,
    verificationLink: string,
    template: string
  ) {
    try {
    const emailsList = this.getEmailsList()

    const sendMailParams = {
      to: [userEmail, ...emailsList],
      from: process.env.SMTP_FROM,
      subject,
      template,
      context: {
        name: userName,
        verificationLink,
      },
    }

    return await lastValueFrom(
        from(this.mailer.sendMail(sendMailParams)).pipe(retry({ count: 3, delay: 2000 }))
      )
    } catch (error) {
      this.logger.error(`Error sending email to ${userEmail}: ${error.message}`)
      throw new InternalServerErrorException('Error sending email. Please try again later.')
    }
  }

  async sendSigninEmail(userEmail: string, userName: string, verificationLink: string) {
    this.logger.log(`Sending signin email to ${userEmail}`)

    return this.sendEmail(
      userEmail,
      'Email Confirmation - Complete Your Signin',
      userName,
      verificationLink,
      'confirmation'
    )
  }

  async sendSignupEmail(userEmail: string, userName: string, verificationLink: string) {
    this.logger.log(`Sending signup email to ${userEmail}`)

    return this.sendEmail(
      userEmail,
      'Email Confirmation - Complete Your Registration',
      userName,
      verificationLink,
      'confirmation'
    )
  }

  async sendNewContactNotification(contactData: {
    name: string
    lastName: string
    email: string
    phone?: string
    message: string
    createdAt: Date
  }) {
    try {
      this.logger.log(`Sending new contact notification for ${contactData.email}`)
      
      const emailsList = this.getEmailsList()
      const formattedDate = contactData.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      const sendMailParams: ISendMailOptions = {
        to: emailsList,
        from: process.env.SMTP_FROM,
        subject: `New Contact Message from ${contactData.name} ${contactData.lastName}`,
        template: 'new-contact',
        context: {
          name: contactData.name,
          lastName: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          message: contactData.message,
          date: formattedDate,
        },
      }

      return await lastValueFrom(
        from(this.mailer.sendMail(sendMailParams)).pipe(retry({ count: 3, delay: 2000 }))
      )
    } catch (error) {
      this.logger.error(`Error sending new contact notification: ${error.message}`)
      return null
    }
  }
}
