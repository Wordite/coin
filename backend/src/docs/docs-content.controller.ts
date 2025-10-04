import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { DocsContentService } from './docs-content.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/constants/roles.constant';

export interface CreateDocumentationDto {
  title: string;
  slug: string;
  content: string;
  description?: string;
  isPublished: boolean;
  order: number;
  type: 'DOCUMENT' | 'CATEGORY';
  categoryId?: string;
}

export interface UpdateDocumentationDto {
  title?: string;
  slug?: string;
  content?: string;
  description?: string;
  isPublished?: boolean;
  order?: number;
  type?: 'DOCUMENT' | 'CATEGORY';
  categoryId?: string;
}

export interface Documentation {
  id: string;
  title: string;
  slug: string;
  content: string;
  description?: string;
  isPublished: boolean;
  order: number;
  type: 'DOCUMENT' | 'CATEGORY';
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Controller('docs/content')
export class DocsContentController {
  constructor(
    private readonly docsContentService: DocsContentService
  ) {}

  @Get()
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async getAll(): Promise<Documentation[]> {
    return await this.docsContentService.getAll();
  }

  @Get('public')
  async getPublished(): Promise<Documentation[]> {
    return await this.docsContentService.getPublished();
  }

  @Get('categories')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async getCategories(): Promise<Documentation[]> {
    return await this.docsContentService.getCategories();
  }

  @Get('fs-structure')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async getFilesystemStructure() {
    return await this.docsContentService.getFilesystemStructure();
  }

  // ===== File-only endpoints =====
  @Get('fs/document')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async readFsDocument(@Query('path') path: string) {
    return await this.docsContentService.readFsDocument(path);
  }

  @Post('fs/document')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async createFsDocument(@Body() body: any) {
    return await this.docsContentService.createFsDocument(body);
  }

  @Put('fs/document')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async updateFsDocument(@Body() body: any) {
    return await this.docsContentService.updateFsDocument(body);
  }

  @Delete('fs/document')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async deleteFsDocument(@Query('path') path: string) {
    await this.docsContentService.deleteFsDocument(path);
    return { message: 'Deleted' };
  }

  @Post('fs/category')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async createFsCategory(@Body('slug') slug: string) {
    await this.docsContentService.createFsCategory(slug);
    return { message: 'Created' };
  }

  @Put('fs/category')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async updateFsCategory(@Body() body: { oldSlug: string; newSlug: string }) {
    await this.docsContentService.updateFsCategory(body.oldSlug, body.newSlug);
    return { message: 'Updated' };
  }

  @Delete('fs/category')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async deleteFsCategory(@Query('slug') slug: string) {
    await this.docsContentService.deleteFsCategory(slug);
    return { message: 'Deleted' };
  }

  @Get('category/:categoryId')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async getDocumentsByCategory(@Param('categoryId') categoryId: string): Promise<Documentation[]> {
    return await this.docsContentService.getDocumentsByCategory(categoryId);
  }

  @Get(':id')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async getById(@Param('id') id: string): Promise<Documentation> {
    return await this.docsContentService.getById(id);
  }

  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string): Promise<Documentation> {
    return await this.docsContentService.getBySlug(slug);
  }

  @Post('document')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async createDocument(@Body() data: CreateDocumentationDto): Promise<Documentation> {
    return await this.docsContentService.create({
      ...data,
      type: 'DOCUMENT'
    });
  }

  @Post('category')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async createCategory(@Body() data: CreateDocumentationDto): Promise<Documentation> {
    console.log('📝 Creating category with data:', data);
    return await this.docsContentService.create({
      ...data,
      type: 'CATEGORY'
    });
  }

  @Put(':id')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async update(@Param('id') id: string, @Body() data: UpdateDocumentationDto): Promise<Documentation> {
    return await this.docsContentService.update(id, data);
  }

  @Delete(':id')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.docsContentService.delete(id);
    return { message: 'Documentation deleted successfully' };
  }

  @Put('reorder')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async reorder(@Body() body: { items: Array<{ id: string; order: number; categoryId?: string }> }): Promise<void> {
    await this.docsContentService.reorder(body.items);
  }

  @Post('sync')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async syncWithFileSystem(): Promise<{ message: string; synced: number; updated: number }> {
    const result = await this.docsContentService.syncWithFileSystem();
    return result;
  }

  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  @Post('sync-bidirectional')
  async syncBidirectional() {
    return this.docsContentService.syncBidirectional();
  }
}
