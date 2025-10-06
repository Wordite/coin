import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import cookieParser from 'cookie-parser'
import DailyRotateFile from 'winston-daily-rotate-file'

async function bootstrap() {

  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf(({level, message, timestamp}) => {
            return `[${timestamp}] ${level}: ${message}`;
          }),
        ),
      }),
      new DailyRotateFile({
        filename: 'logs/all-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info',
      }),
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error',
      }),
    ],
  });
  
  const app = await NestFactory.create(AppModule, {
    logger: logger,
  })

  app.enableCors({
    origin: [
      'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 
      'http://localhost:3000', 'http://localhost:3003', 'http://localhost:3001', 
      'http://192.168.0.102:5174', 'http://192.168.0.102:5175', 'http://192.168.3.2:5174',
      'https://localhost:5173', 'https://localhost:5174', 'https://localhost:5175', 
      'https://localhost:3000', 'https://localhost:3003', 'https://localhost:3001', 
      'https://192.168.0.102:5174', 'https://192.168.0.102:5175', 'http://192.168.3.2:5175',
      'https://localhost', 'https://127.0.0.1', 'https://::1',
      'https://localhost:5173', 'https://localhost:5174', 'https://localhost:5175', 
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'fingerprint'],
  })
  app.setGlobalPrefix('api')
  app.use(cookieParser())
  
  // Health endpoint outside of /api prefix for container health checks
  const httpAdapter: any = app.getHttpAdapter()
  if (httpAdapter?.get) {
    httpAdapter.get('/health', (_req: any, res: any) => {
      res.status(200).json({ status: 'ok' })
    })
  }
  
  // Middleware для логирования куки
  // app.use((req: any, res: any, next: any) => {
  //   console.log('🔍 Request cookies:', req.ip)
    // console.log('🔍 Request cookies:', req.cookies)
    // console.log('🔍 Request headers:', req.headers)
    // console.log('🔍 Cookie header:', req.headers.cookie)
    // console.log('🔍 Origin:', req.headers.origin)
    // console.log('🔍 Referer:', req.headers.referer)
  //   next()
  // })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  const port = process.env.PORT || 3000
  await app.listen(port, '0.0.0.0')

  console.log(`🚀 Application is running on:`)
  console.log(`   HTTP:  http://localhost:${port}`)
}

bootstrap()
