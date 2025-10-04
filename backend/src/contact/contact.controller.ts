import { Controller, Post, Get, Put, Delete, Body, Param, Query, Headers, Req, BadRequestException } from '@nestjs/common'
import { ContactService } from './contact.service'
import type { CreateContactDto, ContactResponse, ContactsListResponse } from './contact.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { Roles } from 'src/auth/constants/roles.constant'
import { AntiSpamService } from 'src/anti-spam/anti-spam.service'
import { fingerprintKey } from 'src/common/utils/fingerprint'
import type { Request } from 'express'

@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly antiSpamService: AntiSpamService
  ) {}

  @Post()
  @Auth({ public: true, fingerprint: true, antiSpam: true })
  async createContact(
    @Body() data: CreateContactDto,
    @Headers('fingerprint') fingerprint: string,
    @Req() req: Request
  ): Promise<ContactResponse> {
    const ip = req.ip || 'unknown'
    const ua = req.get('user-agent') || 'unknown'
    const key = fingerprintKey(fingerprint, ip, ua)

    if (data.timeToFill && data.timeToFill < 2000) {
      const result = await this.antiSpamService.addPoints(key, 20, {
        reason: 'fast_fill',
        timeToFill: data.timeToFill,
        ip,
        ua
      })
      
      if (result.blocked) {
        throw new Error('User blocked due to suspicious activity')
      }
    }

    const existingContacts = await this.contactService.getContactsByEmail(data.email)
    if (existingContacts.length > 0) {
      const result = await this.antiSpamService.addPoints(key, 10, {
        reason: 'duplicate_email',
        email: data.email,
        ip,
        ua
      })
      
      if (result.blocked) {
        throw new Error('User blocked due to duplicate submissions')
      }
    }

    const contactData = {
      ...data,
      fingerprint: fingerprint
    }
    return this.contactService.createContact(contactData)
  }

  @Get()
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async getContacts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isRead') isRead?: string,
  ): Promise<ContactsListResponse> {
    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 10
    const isReadFilter = isRead ? isRead === 'true' : undefined

    return this.contactService.getContacts(pageNum, limitNum, search, isReadFilter)
  }

  @Get('unread-count')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async getUnreadCount(): Promise<{ count: number }> {
    const count = await this.contactService.getUnreadCount()
    return { count }
  }

  @Get('read-count')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async getReadCount(): Promise<{ count: number }> {
    const count = await this.contactService.getReadCount()
    return { count }
  }

  @Get(':id')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async getContactById(@Param('id') id: string): Promise<ContactResponse | null> {
    return this.contactService.getContactById(id)
  }

  @Put(':id/read')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async markAsRead(@Param('id') id: string): Promise<ContactResponse> {
    try {
      return await this.contactService.markAsRead(id)
    } catch (error) {
      throw new BadRequestException('Contact not found')
    }
  }

  @Put(':id/unread')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async markAsUnread(@Param('id') id: string): Promise<ContactResponse> {
    try {
      return await this.contactService.markAsUnread(id)
    } catch (error) {
      throw new BadRequestException('Contact not found')
    }
  }

  @Delete('delete-all-read')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async deleteAllRead(): Promise<{ success: boolean; deletedCount: number }> {
    const result = await this.contactService.deleteAllRead()
    return { success: true, deletedCount: result.deletedCount }
  }

  @Delete(':id')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async deleteContact(@Param('id') id: string): Promise<{ success: boolean }> {
    try {
      await this.contactService.deleteContact(id)
      return { success: true }
    } catch (error) {
      throw new BadRequestException('Contact not found')
    }
  }
}
