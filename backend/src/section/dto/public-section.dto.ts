export class PublicSectionDto {
  id: string;
  name: string;
  link: string;
  content: Record<string, any>;
  sectionType?: {
    id: string;
    name: string;
    fields: Array<{
      id: string;
      name: string;
      type: string;
      validation?: any;
      textFieldsCount?: number;
    }>;
  } | null;
}

export class PublicSectionResponseDto {
  success: boolean;
  data: PublicSectionDto;
  message?: string;
} 