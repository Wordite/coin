import { Module, forwardRef } from '@nestjs/common';
import { SessionService } from './session.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [PrismaModule, forwardRef(() => UserModule)],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
