import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediaResponseDto } from './dto/media-response.dto';
import { Media } from './interfaces/media.interface';
import { mediaConfig } from './media.config';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMediaDto: CreateMediaDto): Promise<MediaResponseDto> {
    const media = await this.prisma.media.create({
      data: createMediaDto,
    });

    return this.mapToResponse(media);
  }

  async findAll(): Promise<MediaResponseDto[]> {
    const media = await this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return media.map(this.mapToResponse);
  }

  async findOne(id: string): Promise<MediaResponseDto> {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    return this.mapToResponse(media);
  }

  async remove(id: string): Promise<void> {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    // Delete file from filesystem
    try {
      if (fs.existsSync(media.path)) {
        fs.unlinkSync(media.path);
      }
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
    }

    // Delete from database
    await this.prisma.media.delete({
      where: { id },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<MediaResponseDto> {
    
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type - support images and SVG
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (!mediaConfig.allowedMimeTypes.includes(file.mimetype) && !mediaConfig.allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException('Only image files (JPG, PNG, GIF, WebP, SVG) are allowed');
    }

    // Validate file size
    if (file.size > mediaConfig.maxFileSize) {
      throw new BadRequestException(`File size too large. Maximum size is ${mediaConfig.maxFileSize / (1024 * 1024)}MB`);
    }

    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      let processedBuffer: Buffer;
      let finalFilename: string;
      let finalMimeType: string;
      let finalSize: number;
      let finalExtension: string;

      // Check if file should be processed (not GIF or SVG)
      const shouldProcess = file.mimetype !== 'image/gif' && 
                           file.mimetype !== 'image/svg+xml' && 
                           fileExtension !== '.gif' && 
                           fileExtension !== '.svg';

      if (shouldProcess) {
        // Process image: compress and convert to WebP
        try {
          console.log(`Processing image: ${file.originalname} (${file.size} bytes) -> WebP`);
          
          processedBuffer = await sharp(file.buffer)
            .webp({ 
              quality: mediaConfig.webp.quality,
              effort: mediaConfig.webp.effort,
              nearLossless: mediaConfig.webp.nearLossless
            })
            .toBuffer();
          
          finalExtension = '.webp';
          finalMimeType = 'image/webp';
          finalSize = processedBuffer.length;
          finalFilename = `${uuidv4()}${finalExtension}`;
          
          const compressionRatio = ((file.size - finalSize) / file.size * 100).toFixed(1);
          const newOriginalName = this.updateOriginalName(file.originalname, finalExtension);
          console.log(`Image processed successfully: ${file.originalname} -> ${finalFilename}`);
          console.log(`Original name updated: ${file.originalname} -> ${newOriginalName}`);
          console.log(`Compression: ${file.size} bytes -> ${finalSize} bytes (${compressionRatio}% reduction)`);
        } catch (error) {
          console.warn('Failed to process image, using original:', error);
          // Fallback to original file if processing fails
          processedBuffer = file.buffer;
          finalExtension = fileExtension;
          finalMimeType = file.mimetype;
          finalSize = file.size;
          finalFilename = `${uuidv4()}${finalExtension}`;
        }
      } else {
        // Keep original file for GIF and SVG
        console.log(`Keeping original file: ${file.originalname} (GIF/SVG format)`);
        processedBuffer = file.buffer;
        finalExtension = fileExtension;
        finalMimeType = file.mimetype;
        finalSize = file.size;
        finalFilename = `${uuidv4()}${finalExtension}`;
      }

      // Save processed file
      const filePath = path.join(uploadsDir, finalFilename);
      fs.writeFileSync(filePath, processedBuffer);

      // Get image dimensions
      let width: number | null = null;
      let height: number | null = null;

      try {
        // Skip dimension extraction for SVG files
        if (finalMimeType !== 'image/svg+xml' && finalExtension !== '.svg') {
          const imageInfo = await sharp(processedBuffer).metadata();
          width = imageInfo.width || null;
          height = imageInfo.height || null;
        }
      } catch (error) {
        console.warn('Could not get image dimensions:', error);
      }

      // Create media record
      const mediaData: CreateMediaDto = {
        filename: finalFilename,
        originalName: this.updateOriginalName(file.originalname, finalExtension),
        mimeType: finalMimeType,
        size: finalSize,
        path: filePath,
        url: `/uploads/${finalFilename}`,
        width,
        height,
      };

      return await this.create(mediaData);
    } catch (error) {
      throw new BadRequestException(`Error uploading file: ${error.message}`);
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<MediaResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Обновляет оригинальное имя файла, заменяя расширение на новое
   * @param originalName - оригинальное имя файла
   * @param newExtension - новое расширение
   * @returns обновленное имя файла
   */
  private updateOriginalName(originalName: string, newExtension: string): string {
    const nameWithoutExtension = path.parse(originalName).name;
    return `${nameWithoutExtension}${newExtension}`;
  }

  private mapToResponse(media: Media): MediaResponseDto {
    return {
      id: media.id,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
      filename: media.filename,
      originalName: media.originalName,
      mimeType: media.mimeType,
      size: media.size,
      path: media.path,
      url: media.url,
      width: media.width,
      height: media.height,
      alt: media.alt,
      description: media.description,
    };
  }
}
