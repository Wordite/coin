import { Module, forwardRef } from '@nestjs/common'
import { MailService } from './mail.service'
import { MailController } from './mail.controller'
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter'
import { MailerModule } from '@nestjs-modules/mailer'
import { SessionModule } from '../session/session.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: true,
          auth: {
            user: process.env.SMTP_FROM || '',
            pass: process.env.SMTP_PASSWORD || '',
          },
        },
        defaults: {
          from: `"No Reply" <${process.env.SMTP_FROM}>`,
        },
        template: {
          dir: __dirname + '/../../templates',
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    SessionModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
