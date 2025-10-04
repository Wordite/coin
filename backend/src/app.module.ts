import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SessionModule } from './session/session.module';
import { ActivationLinkModule } from './activation-link/activation-link.module';
import { MailModule } from './mail/mail.module';
import { AuthorizationRequestModule } from './authorization-request/authorization-request.module';
import { MediaModule } from './media/media.module';
import { SectionModule } from './section/section.module';
import { SettingsModule } from './settings/settings.module';
import { CoinModule } from './coin/coin.module';
import { ContactModule } from './contact/contact.module';
import { DocsModule } from './docs/docs.module';
import { AntiSpamModule } from './anti-spam/anti-spam.module';
import { VaultModule } from './vault/vault.module';
import { CleanupModule } from './cleanup/cleanup.module';
import { SolanaService } from './solana/solana.service';
import { SolanaModule } from './solana/solana.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UserModule,
    SessionModule,
    ActivationLinkModule,
    MailModule,
    AuthorizationRequestModule,
    MediaModule,
    SectionModule,
    SettingsModule,
    CoinModule,
    ContactModule,
    DocsModule,
    AntiSpamModule,
    VaultModule,
    CleanupModule,
    SolanaModule,
    WalletModule,
  ],
  providers: [SolanaService],
})
export class AppModule {}
