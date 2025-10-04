import { IsString, IsOptional, IsArray, ValidateNested, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSectionFieldDto {
  @IsString()
  name: string;

  @IsString()
  type: 'CONTENT' | 'IMAGES' | 'MARKDOWN' | 'COMPLEX';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  required?: boolean;

  @IsOptional()
  multiple?: boolean;

  @IsOptional()
  withImage?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxSelection?: number;

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsOptional()
  validation?: Record<string, any>;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  textFieldsCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class CreateSectionTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSectionFieldDto)
  fields: CreateSectionFieldDto[];
} 