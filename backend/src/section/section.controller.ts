import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param,
  HttpCode,
  HttpStatus, 
  NotFoundException
} from '@nestjs/common';
import { SectionService } from './section.service';
import { CreateSectionTypeDto } from './dto/create-section-type.dto';
import { UpdateSectionTypeDto } from './dto/update-section-type.dto';
import { PublicSectionResponseDto } from './dto/public-section.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/constants/roles.constant';

@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  // Section Types
  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Post('types')
  @HttpCode(HttpStatus.CREATED)
  createSectionType(@Body() createSectionTypeDto: CreateSectionTypeDto) {
    return this.sectionService.createSectionType(createSectionTypeDto);
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Get('types')
  findAllSectionTypes() {
    return this.sectionService.findAllSectionTypes();
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Get('types/:id')
  findSectionTypeById(@Param('id') id: string) {
    return this.sectionService.findSectionTypeById(id);
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Put('types/:id')
  updateSectionType(
    @Param('id') id: string,
    @Body() updateSectionTypeDto: UpdateSectionTypeDto,
  ) {
    return this.sectionService.updateSectionType(id, updateSectionTypeDto);
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Delete('types/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSectionType(@Param('id') id: string) {
    return this.sectionService.deleteSectionType(id);
  }

  // Sections
  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Get()
  findAllSections() {
    return this.sectionService.findAllSections();
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Get(':id')
  findSectionById(@Param('id') id: string) {
    return this.sectionService.findSectionById(id);
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Get('url/:url')
  findSectionByUrl(@Param('url') url: string) {
    return this.sectionService.findSectionByUrl(url);
  }

  @Auth({ public: true })
  @Get('public/url/:url')
  async findPublicSectionByUrl(@Param('url') url: string): Promise<PublicSectionResponseDto> {
    try {
      const data = await this.sectionService.findPublicSectionByUrl(url);
      
      return {
        success: true,
        data,
        message: 'Section data retrieved successfully'
      };
    } catch (error) {
      throw new NotFoundException('Not found')
    }
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createSection(@Body() data: { name: string; link: string; content?: any; sectionTypeId?: string }) {
    return this.sectionService.createSection(data);
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Put(':id')
  updateSection(
    @Param('id') id: string,
    @Body() data: { name?: string; link?: string; content?: string; sectionTypeId?: string },
  ) {
    return this.sectionService.updateSection(id, data);
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSection(@Param('id') id: string) {
    return this.sectionService.deleteSection(id);
  }
}
