# Media Library API

## Overview
The Media Library API provides endpoints for managing media files (images) in the system.

## Endpoints

### GET /media
Get all media files
- **Response**: Array of MediaResponseDto objects
- **Query Parameters**: None

### GET /media/:id
Get a specific media file by ID
- **Response**: MediaResponseDto object
- **Path Parameters**: 
  - `id`: Media file ID

### POST /media/upload
Upload a single media file
- **Request**: Multipart form data with `file` field
- **Response**: MediaResponseDto object
- **File Requirements**:
  - Type: Image files only (jpg, jpeg, png, gif, webp)
  - Max Size: 10MB
- **Headers**: `Content-Type: multipart/form-data`

### POST /media/upload-multiple
Upload multiple media files
- **Request**: Multipart form data with `files` field (array)
- **Response**: Array of MediaResponseDto objects
- **File Requirements**:
  - Type: Image files only (jpg, jpeg, png, gif, webp)
  - Max Size: 10MB per file
  - Max Count: 10 files
- **Headers**: `Content-Type: multipart/form-data`

### DELETE /media/:id
Delete a media file
- **Response**: 204 No Content
- **Path Parameters**: 
  - `id`: Media file ID

## Data Models

### MediaResponseDto
```typescript
{
  id: string;
  createdAt: Date;
  updatedAt: Date;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  description?: string;
}
```

## File Storage
- Files are stored in the `uploads/` directory
- Files are served statically at `/uploads/` endpoint
- Unique filenames are generated using UUID
- Original filenames are preserved in the database

## Features
- Automatic image dimension extraction
- File type validation
- File size validation
- Unique filename generation
- Static file serving
- Database record management 