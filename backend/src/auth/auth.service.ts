import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { UserService, Transaction } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import { jwtConstants } from './constants/jwt.constant'
import { SessionService } from 'src/session/session.service'
import { Roles } from './constants/roles.constant'
import { MailService } from 'src/mail/mail.service'
import { addUrl } from 'src/common/utils/addUrl'
import { Session, User } from '@prisma/client'
import { hash, compare } from 'src/common/utils/hash'
import { AuthorizationRequestService } from 'src/authorization-request/authorization-request.service'
import { Role } from '@prisma/client'
import { SignUpEmailDto } from './dto/sign-up-email.dto'

@Injectable()
export class AuthService {
  constructor(
    private users: UserService,
    private jwt: JwtService,
    private session: SessionService,
    private mail: MailService,
    private authorizationRequest: AuthorizationRequestService
  ) {}

  private readonly logger = new Logger(AuthService.name)

  async signInByEmail(
    email: string,
    password: string,
    fingerprint: string
  ): Promise<{
    refreshToken: string
  }> {
    this.logger.log(`Sign in by email: ${email}`)
    const user = await this.users.findByEmail(email)

    if (!user) throw new UnauthorizedException('User not found')

    if (!user.password || !user.email) throw new UnauthorizedException('User not found')

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      this.logger.error(`Sign in by email: ${email} wrong password`)
      throw new UnauthorizedException('Wrong password')
    }

    const { activationLink, session } = await this.authorizationRequest.createByEmail(
      email,
      password,
      fingerprint,
      false
    )
    await this.mail.sendSigninEmail(user.email, 'User', addUrl(activationLink.link))

    const { refreshToken, hashedRefreshToken } = await this.getRefreshToken(session.id)
    await this.session.addRefreshToken(session.id, hashedRefreshToken)

    this.logger.log(`Sign in by email: ${email} success`)

    return { refreshToken }
  }

  async signUpByEmail(
    email: string,
    password: string,
    fingerprint: string
  ): Promise<{
    refreshToken: string
  }> {
    this.logger.log(`Sign up by email: ${email}`)

    const existingUser = await this.users.findByEmail(email)
    if (existingUser) throw new UnauthorizedException('User already exists')

    const { activationLink, session } = await this.authorizationRequest.createByEmail(
      email,
      password,
      fingerprint,
      true
    )
    await this.mail.sendSignupEmail(email, 'User', addUrl(activationLink.link))

    const { refreshToken, hashedRefreshToken } = await this.getRefreshToken(session.id)
    await this.session.addRefreshToken(session.id, hashedRefreshToken)

    this.logger.log(`Sign up by email: ${email} success`)

    return { refreshToken }
  }

  async connectWallet(address: string): Promise<{
    transactions: Transaction[]
    totalCoinsPurchased: number
    totalCoinsReceived: number
    totalSpentSOL: number
    totalSpentUSDT: number
  }> {
    this.logger.log(`Connect wallet: ${address}`)
    const user = await this.users.findByWalletAddress(address)

    if (!user) {
      const newUser = await this.users.createUserByWalletAddress(address)
      const stats = this.users.getStatsByUser(newUser)
  
      return {
        transactions: newUser.transactions as Transaction[] | [],
        totalCoinsPurchased: stats.totalCoinsPurchased,
        totalCoinsReceived: stats.totalCoinsReceived,
        totalSpentSOL: stats.totalSpentSOL,
        totalSpentUSDT: stats.totalSpentUSDT,
      }
    }

    const stats = this.users.getStatsByUser(user)

    return {
      transactions: user.transactions as Transaction[] | [],
      totalCoinsPurchased: stats.totalCoinsPurchased,
      totalCoinsReceived: stats.totalCoinsReceived,
      totalSpentSOL: stats.totalSpentSOL,
      totalSpentUSDT: stats.totalSpentUSDT,
    }
  }

  async getTokens(options: { userId: string; sessionId: string; role: Role | null }): Promise<{
    accessToken: string
    refreshToken: string
    hashedRefreshToken: string
  }> {
    const { userId, sessionId, role } = options

    const [accessToken, { refreshToken, hashedRefreshToken }] = await Promise.all([
      this.getAccessToken(userId, role),
      this.getRefreshToken(sessionId),
    ])

    return { accessToken, refreshToken, hashedRefreshToken }
  }

  private async getAccessToken(userId: string, role: Role | null): Promise<string> {
    const payload = { sub: userId, role: role || Roles.USER }

    const accessToken = await this.jwt.signAsync(payload, {
      secret: jwtConstants.accessSecret,
      expiresIn: jwtConstants.accessExpires,
    })

    return accessToken
  }

  private async getRefreshToken(sessionId: string): Promise<{
    refreshToken: string
    hashedRefreshToken: string
  }> {
    const payload = { sub: sessionId }

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: jwtConstants.refreshExpires,
    })

    const hashedRefreshToken = await hash(refreshToken)

    return { refreshToken, hashedRefreshToken }
  }

  async updateRefreshToken(
    refreshToken: string,
    fingerprint: string
  ): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    const payload = await this.getRefreshTokenPayload(refreshToken)
    const sessionId = payload.sub
    const session = await this.session.find(sessionId)

    await this.checkSession(session)
    await this.checkRefreshToken(refreshToken, session)
    await this.checkFingerprint(fingerprint, session)

    if (!session.userId) {
      throw new UnauthorizedException('Session has no associated user')
    }

    const user = await this.users.findById(session.userId)
    await this.checkUserAndSessionActivated(user, session)

    const {
      accessToken,
      refreshToken: newRefreshToken,
      hashedRefreshToken,
    } = await this.getTokens({
      userId: user.id,
      sessionId: session.id,
      role: user.role,
    })

    await this.session.updateRefreshToken(session.id, hashedRefreshToken)

    return { accessToken, refreshToken: newRefreshToken }
  }

  async updateAccessToken(refreshToken: string, fingerprint: string): Promise<string> {
    const payload = await this.getRefreshTokenPayload(refreshToken)
    const session = await this.session.find(payload.sub)

    await this.checkSession(session)
    await this.checkFingerprint(fingerprint, session)
    await this.checkRefreshToken(refreshToken, session)

    if (!session.userId) {
      throw new UnauthorizedException('Session has no associated user')
    }

    const user = await this.users.findById(session.userId)
    await this.checkUserAndSessionActivated(user, session)
    this.logger.log(`Update access token: ${session.id} success`)

    const accessToken = await this.getAccessToken(user.id, user.role)
    return accessToken
  }

  async getSessionIdFromRefreshToken(refreshToken: string): Promise<string> {
    const payload = await this.getRefreshTokenPayload(refreshToken)
    return payload.sub
  }

  private async checkFingerprint(fingerprint: string, session: Session): Promise<boolean> {
    const isValidFingerprint = await compare(fingerprint, session.fingerprint)
    if (!isValidFingerprint) throw new UnauthorizedException('Invalid credentials')

    return true
  }

  private async checkRefreshToken(refreshToken: string, session: Session): Promise<boolean> {
    if (session.refreshToken && !(await compare(refreshToken, session.refreshToken))) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    return true
  }

  private async checkSession(session: Session): Promise<boolean> {
    if (!session) throw new UnauthorizedException('Session not found')

    return true
  }

  private async checkUserAndSessionActivated(user: User, session: Session): Promise<boolean> {
    if (!user) throw new UnauthorizedException('User not found')
    if (!session.isActivated) throw new UnauthorizedException('User or session not activated')

    return true
  }

  private async getRefreshTokenPayload(refreshToken: string): Promise<{ sub: string }> {
    let payload: { sub: string }
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: jwtConstants.refreshSecret,
      })
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    return payload
  }

  detectSuspiciousRegistration(signUpDto: SignUpEmailDto): string[] {
    const patterns: string[] = []

    const email = signUpDto.email.toLowerCase()

    const tempEmailDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'temp-mail.org',
      'throwaway.email',
    ]

    if (tempEmailDomains.some((domain) => email.includes(domain))) {
      patterns.push('temp_email_domain')
    }

    if (email.match(/\d{6,}/)) {
      patterns.push('numeric_email')
    }

    if (email.match(/[a-z]{1}\d{4,}/)) {
      patterns.push('single_char_numeric')
    }

    const password = signUpDto.password

    if (password === password.toLowerCase() || password === password.toUpperCase()) {
      patterns.push('no_case_variation')
    }

    if (!/\d/.test(password)) {
      patterns.push('no_numbers')
    }

    if (password.match(/(.)\1{3,}/)) {
      patterns.push('repeating_chars')
    }

    if (password.match(/123|abc|qwe|asd/)) {
      patterns.push('sequential_chars')
    }

    return patterns
  }
}
