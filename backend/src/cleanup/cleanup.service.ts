import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Каждые 2 дня в 02:00 - удаление старых authorization requests
  @Cron('0 2 */2 * *', {
    name: 'cleanup-authorization-requests',
    timeZone: 'UTC',
  })
  async cleanupAuthorizationRequests() {
    this.logger.log('Starting cleanup of authorization requests...');
    
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const result = await this.prisma.authorizationRequest.deleteMany({
        where: {
          createdAt: {
            lt: oneDayAgo,
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} authorization requests older than 1 day`);
    } catch (error) {
      this.logger.error('Error cleaning up authorization requests:', error);
    }
  }

  // Каждые 2 дня в 02:30 - удаление старых activation links
  @Cron('30 2 */2 * *', {
    name: 'cleanup-activation-links',
    timeZone: 'UTC',
  })
  async cleanupActivationLinks() {
    this.logger.log('Starting cleanup of activation links...');
    
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const result = await this.prisma.activationLink.deleteMany({
        where: {
          createdAt: {
            lt: oneDayAgo,
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} activation links older than 1 day`);
    } catch (error) {
      this.logger.error('Error cleaning up activation links:', error);
    }
  }

  // Каждую неделю в понедельник в 03:00 - удаление старых contacts
  @Cron('0 3 * * 1', {
    name: 'cleanup-contacts',
    timeZone: 'UTC',
  })
  async cleanupContacts() {
    this.logger.log('Starting cleanup of contacts...');
    
    try {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      const result = await this.prisma.contact.deleteMany({
        where: {
          createdAt: {
            lt: twoMonthsAgo,
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} contacts older than 2 months`);
    } catch (error) {
      this.logger.error('Error cleaning up contacts:', error);
    }
  }

  // Каждую неделю в понедельник в 03:30 - удаление старых sessions
  @Cron('30 3 * * 1', {
    name: 'cleanup-sessions',
    timeZone: 'UTC',
  })
  async cleanupSessions() {
    this.logger.log('Starting cleanup of sessions...');
    
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const result = await this.prisma.session.deleteMany({
        where: {
          createdAt: {
            lt: oneMonthAgo,
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} sessions older than 1 month`);
    } catch (error) {
      this.logger.error('Error cleaning up sessions:', error);
    }
  }

  // Каждую неделю в понедельник в 04:00 - удаление пользователей без транзакций старше 3 месяцев
  @Cron('0 4 * * 1', {
    name: 'cleanup-inactive-users',
    timeZone: 'UTC',
  })
  async cleanupInactiveUsers() {
    this.logger.log('Starting cleanup of inactive users...');
    
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const result = await this.prisma.user.deleteMany({
        where: {
          createdAt: {
            lt: threeMonthsAgo,
          },
          transactions: {
            equals: '[]',
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} inactive users older than 3 months with no transactions`);
    } catch (error) {
      this.logger.error('Error cleaning up inactive users:', error);
    }
  }

  // Метод для ручного запуска всех очисток (для тестирования)
  async runAllCleanups() {
    this.logger.log('Running all cleanup tasks manually...');
    
    await this.cleanupAuthorizationRequests();
    await this.cleanupActivationLinks();
    await this.cleanupContacts();
    await this.cleanupSessions();
    await this.cleanupInactiveUsers();
    
    this.logger.log('All cleanup tasks completed');
  }
}
