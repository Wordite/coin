import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constant';
import { JwtAuthGuard } from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';
import { SessionModule } from 'src/session/session.module';
import { RolesGuard } from './guards/roles.guard';
import { ActivationLinkModule } from 'src/activation-link/activation-link.module';
import { MailModule } from 'src/mail/mail.module';
import { AuthorizationRequestModule } from 'src/authorization-request/authorization-request.module';
import { TokenInvalidationService } from './services/token-invalidation.service';
import { RedisModule } from '../redis/redis.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AntiSpamModule } from '../anti-spam/anti-spam.module';
import { StrongAuthGuard } from './guards/strong.guard';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [
    RedisModule,
    PrismaModule,
    AntiSpamModule,
    AuthorizationRequestModule,
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.accessSecret,
      signOptions: { expiresIn: '60s' },
    }),
    SessionModule,
    ActivationLinkModule,
    MailModule,
    TransactionModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    LocalAuthGuard,
    RolesGuard,
    TokenInvalidationService,
    StrongAuthGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
