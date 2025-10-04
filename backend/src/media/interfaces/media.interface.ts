export interface Media {
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

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
} 