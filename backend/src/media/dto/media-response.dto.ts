export class MediaResponseDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  width: number | null;
  height: number | null;
  alt: string | null;
  description: string | null;
} 