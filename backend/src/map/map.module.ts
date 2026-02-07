import { Module } from '@nestjs/common'
import { MapService } from './map.service'
import { MapController } from './map.controller'
import { PrismaService } from '../prisma/prisma.service'

@Module({
  controllers: [MapController],
  providers: [MapService, PrismaService],
  exports: [MapService],
})
export class MapModule {}
