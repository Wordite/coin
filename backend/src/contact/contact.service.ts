import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'

export interface CreateContactDto {
  name: string
  lastName: string
  email: string
  phone: string | null
  message: string
  fingerprint: string
  timeToFill?: number
}

export interface ContactResponse {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  lastName: string
  email: string
  phone: string | null
  message: string
  isRead: boolean
}

export interface ContactsListResponse {
  contacts: ContactResponse[]
  total: number
  totalPages: number
  currentPage: number
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name)
  
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  async createContact(data: CreateContactDto): Promise<ContactResponse> {
    const contact = await this.prisma.contact.create({
      data: {
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        message: data.message,
        fingerprint: data.fingerprint,
      },
    })

    this.sendEmailNotification(contact).catch(error => {
      this.logger.error(`Failed to send email notification for contact ${contact.id}: ${error.message}`)
    })

    return {
      id: contact.id,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      name: contact.name,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
      isRead: contact.isRead,
    }
  }

  private async sendEmailNotification(contact: ContactResponse): Promise<void> {
    try {
      await this.mailService.sendNewContactNotification({
        name: contact.name,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone || undefined,
        message: contact.message,
        createdAt: contact.createdAt,
      })
      this.logger.log(`Email notification sent for contact ${contact.id}`)
    } catch (error) {
      this.logger.error(`Error sending email notification for contact ${contact.id}: ${error.message}`)
      throw error
    }
  }

  async getContacts(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isRead?: boolean
  ): Promise<ContactsListResponse> {
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (isRead !== undefined) {
      where.isRead = isRead
    }

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contact.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      contacts: contacts.map(contact => ({
        id: contact.id,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
        name: contact.name,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        message: contact.message,
        isRead: contact.isRead,
      })),
      total,
      totalPages,
      currentPage: page,
    }
  }

  async getContactsByEmail(email: string): Promise<ContactResponse[]> {
    const contacts = await this.prisma.contact.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
    })

    return contacts.map(contact => ({
      id: contact.id,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      name: contact.name,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
      isRead: contact.isRead,
    }))
  }

  async getContactById(id: string): Promise<ContactResponse | null> {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    })

    if (!contact) {
      return null
    }

    return {
      id: contact.id,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      name: contact.name,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
      isRead: contact.isRead,
    }
  }

  async markAsRead(id: string): Promise<ContactResponse> {
    const existingContact = await this.prisma.contact.findUnique({
      where: { id },
    })

    if (!existingContact) {
      throw new Error('Contact not found')
    }

    const contact = await this.prisma.contact.update({
      where: { id },
      data: { isRead: true },
    })

    return {
      id: contact.id,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      name: contact.name,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
      isRead: contact.isRead,
    }
  }

  async markAsUnread(id: string): Promise<ContactResponse> {
    const existingContact = await this.prisma.contact.findUnique({
      where: { id },
    })

    if (!existingContact) {
      throw new Error('Contact not found')
    }

    const contact = await this.prisma.contact.update({
      where: { id },
      data: { isRead: false },
    })

    return {
      id: contact.id,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      name: contact.name,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
      isRead: contact.isRead,
    }
  }

  async deleteContact(id: string): Promise<void> {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    })

    if (!contact) {
      throw new Error('Contact not found')
    }

    await this.prisma.contact.delete({
      where: { id },
    })
  }

  async deleteAllRead(): Promise<{ deletedCount: number }> {
    const result = await this.prisma.contact.deleteMany({
      where: { isRead: true },
    })
    return { deletedCount: result.count }
  }

  async getUnreadCount(): Promise<number> {
    return this.prisma.contact.count({
      where: { isRead: false },
    })
  }

  async getReadCount(): Promise<number> {
    return this.prisma.contact.count({
      where: { isRead: true },
    })
  }
}
