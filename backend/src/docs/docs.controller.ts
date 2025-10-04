import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { DocsService } from './docs.service';
import type { DocsConfigData } from './docs-config.service';
import { DocsConfigService } from './docs-config.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/constants/roles.constant';

@Controller('docs')
export class DocsController {
  constructor(
    private readonly docsService: DocsService,
    private readonly docsConfigService: DocsConfigService
  ) {}

  @Get('content')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async getContent() {
    return await this.docsService.getContent();
  }

  @Get('file/*filePath')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async getFile(@Param('filePath') filePath: string) {
    const fileData = await this.docsService.readFile(filePath);
    return {
      filePath,
      title: fileData.frontmatter.title || '',
      description: fileData.frontmatter.description || '',
      sidebar_position: fileData.frontmatter.sidebar_position || 1,
      content: fileData.content,
      frontmatter: fileData.frontmatter
    };
  }

  @Post('file')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async createFile(@Body() body: { 
    filePath: string; 
    title: string; 
    content: string; 
    description?: string;
    sidebar_position?: number;
    category?: string;
  }) {
    await this.docsService.createFile(
      body.filePath, 
      body.title, 
      body.content, 
      body.description,
      body.sidebar_position
    );
    return { message: 'File created successfully' };
  }

  @Put('file/*filePath')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async updateFile(@Param('filePath') filePath: string, @Body() updates: { 
    title?: string; 
    content?: string; 
    description?: string; 
    sidebar_position?: number;
    frontmatter?: any;
  }) {
    await this.docsService.updateFile(filePath, updates);
    return { message: 'File updated successfully' };
  }

  @Delete('file/*filePath')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async deleteFile(@Param('filePath') filePath: string) {
    await this.docsService.deleteFile(filePath);
    return { message: 'File deleted successfully' };
  }

  @Post('file/*filePath/rename')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async renameFile(@Param('filePath') filePath: string, @Body() body: { newPath: string }) {
    await this.docsService.renameFile(filePath, body.newPath);
    return { message: 'File renamed successfully' };
  }

  @Post('file/*filePath/move')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async moveFile(@Param('filePath') filePath: string, @Body() body: { newCategory: string }) {
    await this.docsService.moveFileToCategory(filePath, body.newCategory);
    return { message: 'File moved successfully' };
  }

  @Post('category')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async createCategory(@Body() body: { name: string }) {
    await this.docsService.createCategory(body.name);
    return { message: 'Category created successfully' };
  }

  @Delete('category/:name')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async deleteCategory(@Param('name') name: string) {
    await this.docsService.deleteCategory(name);
    return { message: 'Category deleted successfully' };
  }

  @Post('category/:name/rename')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async renameCategory(@Param('name') name: string, @Body() body: { newName: string }) {
    await this.docsService.renameCategory(name, body.newName);
    return { message: 'Category renamed successfully' };
  }

  @Post('rebuild')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async rebuildDocs() {
    await this.docsService.rebuildDocs();
    return { message: 'Docs rebuild completed successfully' };
  }

  // Docs Configuration endpoints
  @Get('config')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async getDocsConfig(): Promise<DocsConfigData> {
    return this.docsConfigService.getDocsConfig();
  }

  @Get('config/public')
  async getPublicDocsConfig(): Promise<DocsConfigData> {
    return this.docsConfigService.getDocsConfig();
  }

  @Put('config')
  @Auth({ roles: [Roles.ADMIN, Roles.MANAGER], strong: true })
  async updateDocsConfig(@Body() configData: DocsConfigData): Promise<DocsConfigData> {
    return this.docsConfigService.updateDocsConfig(configData);
  }
}
