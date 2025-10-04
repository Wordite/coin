import { Controller, Get } from '@nestjs/common'
import { MailService } from './mail.service'
import { Auth } from '../auth/decorators/auth.decorator';
import { Roles } from 'src/auth/constants/roles.constant';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Get('test')
  async test() {
    const userEmail = 'roken922@gmail.com'
    const userName = 'Test User'
    const verificationLink = 'https://test.com'

    await this.mailService.sendSigninEmail(userEmail, userName, verificationLink)
    return { message: 'Email sent successfully' }
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Get('test-contact')
  async testContact() {
    const contactData = {
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      message: 'This is a test message to check email notifications.',
      createdAt: new Date(),
    }

    await this.mailService.sendNewContactNotification(contactData)
    return { message: 'Contact notification email sent successfully' }
  }
}
