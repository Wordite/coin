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

  const origins = process.env.NODE_ENV === 'production' ? [
    'https://tycoin.app', 'https://admin.tycoin.app', 'https://docs.tycoin.app', 
  ] : [
    'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:8080',
    'http://localhost:3000', 'http://localhost:3003', 'http://localhost:3001', 
    'http://192.168.0.102:5174', 'http://192.168.0.102:5175', 'http://192.168.3.2:5174',
    'https://localhost:5173', 'https://localhost:5174', 'https://localhost:5175', 
    'https://localhost:3000', 'https://localhost:3003', 'https://localhost:3001', 
    'https://192.168.0.102:5174', 'https://192.168.0.102:5175', 'http://192.168.3.2:5175',
    'https://localhost', 'https://127.0.0.1', 'https::1',
    'https://localhost:5173', 'https://localhost:5174', 'https://localhost:5175', 
  ]

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'fingerprint',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Referer',
    ],
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
  
  // app.use((req: any, res: any, next: any) => {
  //   if (req.path.startsWith('/api/')) {
  //     console.log('🔍 CORS Debug - Origin:', req.headers.origin)
  //     console.log('🔍 CORS Debug - Referer:', req.headers.referer)
  //     console.log('🔍 CORS Debug - Host:', req.headers.host)
  //     console.log('🔍 CORS Debug - Method:', req.method)
  //     console.log('🔍 CORS Debug - Path:', req.path)
  //   }
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
