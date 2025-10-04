import { api } from '../app/api';
import type { 
  SectionType, 
  Section, 
  CreateSectionTypeRequest, 
  UpdateSectionTypeRequest,
  CreateSectionRequest,
  UpdateSectionRequest
} from '../entities/section/types';

class SectionApiService {
  // Section Types
  async createSectionType(data: CreateSectionTypeRequest): Promise<SectionType> {
    const response = await api.post('/section/types', data);
    return response.data;
  }

  async getSectionTypes(): Promise<SectionType[]> {
    const response = await api.get('/section/types');
    return response.data;
  }

  async getSectionTypeById(id: string): Promise<SectionType> {
    const response = await api.get(`/section/types/${id}`);
    return response.data;
  }

  async updateSectionType(id: string, data: UpdateSectionTypeRequest): Promise<SectionType> {
    const response = await api.put(`/section/types/${id}`, data);
    return response.data;
  }

  async deleteSectionType(id: string): Promise<void> {
    await api.delete(`/section/types/${id}`);
  }

  // Sections
  async getSections(): Promise<Section[]> {
    const response = await api.get('/section');
    return response.data;
  }

  async getSectionById(id: string): Promise<Section> {
    const response = await api.get(`/section/${id}`);
    return response.data;
  }

  async createSection(data: CreateSectionRequest): Promise<Section> {
    const response = await api.post('/section', data);
    return response.data;
  }

  async updateSection(id: string, data: UpdateSectionRequest): Promise<Section> {
    const response = await api.put(`/section/${id}`, data);
    return response.data;
  }

  async deleteSection(id: string): Promise<void> {
    await api.delete(`/section/${id}`);
  }
}

export const sectionApi = new SectionApiService(); 