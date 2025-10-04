import { IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  filename: string;

  @IsString()
  originalName: string;

  @IsString()
  mimeType: string;

  @IsInt()
  @Min(0)
  size: number;

  @IsString()
  path: string;

  @IsString()
  url: string;

  @IsOptional()
  width?: number | null;

  @IsOptional()
  height?: number | null;

  @IsOptional()
  @IsString()
  alt?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;
} 