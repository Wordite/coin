import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { MediaResponseDto } from './dto/media-response.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/constants/roles.constant';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Get()
  async findAll(): Promise<MediaResponseDto[]> {
    return this.mediaService.findAll();
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MediaResponseDto> {
    return this.mediaService.findOne(id);
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') }), // 10MB
          //  validation is handled in MediaService
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<MediaResponseDto> {
    return this.mediaService.uploadFile(file);
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadMultipleFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') }), // 10MB
          //  validation is handled in MediaService
        ],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
  ): Promise<MediaResponseDto[]> {
    return this.mediaService.uploadMultipleFiles(files);
  }

  @Auth({ roles: [Roles.ADMIN], strong: true })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.mediaService.remove(id);
  }
}
