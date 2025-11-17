import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
  Logger,
  Headers,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { SignInEmailDto } from './dto/sign-in-email.dto'
import type { Response, Request } from 'express'
import { SignUpEmailDto } from './dto/sign-up-email.dto'
import { SessionService } from 'src/session/session.service'
import { Auth } from './decorators/auth.decorator'
import { Roles } from './constants/roles.constant'
import { AntiSpamService } from 'src/anti-spam/anti-spam.service'
import getFingerprintFromReq from 'src/common/utils/getFingerprintFromReq'
import { WalletDto } from './dto/wallet.dto'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly auth: AuthService,
    private readonly session: SessionService,
    private readonly antiSpamService: AntiSpamService
  ) {}

  @Post('sign-in')
  @Auth({ fingerprint: true, public: true, antiSpam: false })
  async signIn(@Body() signInDto: SignInEmailDto, @Req() req: Request, @Res({ passthrough: true }) res: Response, @Headers('fingerprint') fingerprint: string) {
    const key = getFingerprintFromReq(req, fingerprint)

    try {
      const { refreshToken } = await this.auth.signInByEmail(signInDto.email, signInDto.password, fingerprint)

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === 'production' ? '.tycoin.app' : 'localhost',
      })

      return { message: 'Login successful' }
    } catch (error) {
      await this.antiSpamService.addPoints(key, 10, {
        reason: 'failed_sign_in',
        email: signInDto.email,
        ip: req.ip,
        ua: req.get('user-agent'),
        timestamp: Date.now()
      })
      
      throw error
    }
  }

  @Post('/wallet')
  @Auth({ fingerprint: true, public: true, antiSpam: true })
  async wallet(@Body() walletDto: WalletDto, @Req() req: Request, @Res({ passthrough: true }) res: Response, @Headers('fingerprint') fingerprint: string) {
    const key = getFingerprintFromReq(req, fingerprint)
    
    try {
      const data = await this.auth.connectWallet(walletDto.address)

      await this.antiSpamService.addPoints(key, 2, {
        reason: 'success_wallet_connection',
        walletAddress: walletDto.address,
        ip: req.ip,
        ua: req.get('user-agent'),
        timestamp: Date.now()
      })

      return { message: 'Wallet connected', data }
    } catch (error) {
      await this.antiSpamService.addPoints(key, 15, {
        reason: 'failed_wallet_connection',
        walletAddress: walletDto.address,
        ip: req.ip,
        ua: req.get('user-agent'),
        timestamp: Date.now()
      })
      
      throw error
    }
  }

  @Post('sign-up')
  @Auth({ fingerprint: true, public: true, antiSpam: true })
  async signUp(@Body() signUpDto: SignUpEmailDto, @Req() req: Request, @Res({ passthrough: true }) res: Response, @Headers('fingerprint') fingerprint: string) {
    const key = getFingerprintFromReq(req, fingerprint)
    const suspiciousPatterns = this.auth.detectSuspiciousRegistration(signUpDto)
    
    if (suspiciousPatterns.length > 0) {
      await this.antiSpamService.addPoints(key, 15, {
        reason: 'suspicious_registration',
        patterns: suspiciousPatterns,
        email: signUpDto.email,
        ip: req.ip,
        ua: req.get('user-agent'),
        timestamp: Date.now()
      })
    }

    const { refreshToken } = await this.auth.signUpByEmail(signUpDto.email, signUpDto.password, fingerprint)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === 'production' ? '.tycoin.app' : 'localhost',
    })

    return { message: 'Sign up successful' }
  }

  @Get('refresh')
  @Auth({ fingerprint: true, public: true })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Headers('fingerprint') fingerprint: string) {
    const oldRefreshToken = req.cookies?.refreshToken

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const { refreshToken, accessToken } = await this.auth.updateRefreshToken(oldRefreshToken, fingerprint)

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === 'production' ? '.tycoin.app' : 'localhost',
    })

    return { message: 'Refresh token updated', accessToken }
  }

  @Get('access')
  @Auth({ fingerprint: true, public: true })
  async access(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Headers('fingerprint') fingerprint: string) {
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const accessToken = await this.auth.updateAccessToken(refreshToken, fingerprint)

    if (!accessToken) {
      throw new UnauthorizedException('Something went wrong')
    }

    return { message: 'Access token updated', accessToken }
  }

  @Post('logout')
  @Auth({ fingerprint: true, public: true })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const sessionId = await this.auth.getSessionIdFromRefreshToken(refreshToken)
    await this.session.delete(sessionId)

    res.clearCookie('refreshToken')

    return { message: 'Logout successful' }
  }

  @Get('check')
  @Auth({ fingerprint: true, roles: [Roles.ADMIN, Roles.MANAGER, Roles.USER] })
  async check() {
    return { message: 'Authenticated' }
  }

 
}
