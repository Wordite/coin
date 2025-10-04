import { PartialType } from '@nestjs/mapped-types';
import { CreateSectionTypeDto } from './create-section-type.dto';

export class UpdateSectionTypeDto extends PartialType(CreateSectionTypeDto) {} 