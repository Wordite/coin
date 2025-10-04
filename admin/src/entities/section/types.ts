export interface SectionField {
  id: string;
  name: string;
  type: 'CONTENT' | 'IMAGES' | 'MARKDOWN' | 'COMPLEX';
  description?: string;
  required: boolean;
  multiple: boolean;
  withImage: boolean;
  maxSelection?: number;
  defaultValue?: string;
  validation?: Record<string, any>;
  textFieldsCount?: number;
  order: number;
  sectionTypeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SectionType {
  id: string;
  name: string;
  description?: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  fields: SectionField[];
  sections: Section[];
  _count?: {
    sections: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  name: string;
  link: string;
  content: any;
  sectionTypeId?: string;
  sectionType?: SectionType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionTypeRequest {
  name: string;
  description?: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  fields: {
    name: string;
    type: 'CONTENT' | 'IMAGES' | 'MARKDOWN' | 'COMPLEX';
    description?: string;
    required: boolean;
    multiple: boolean;
    withImage: boolean;
    maxSelection?: number;
    defaultValue?: string;
    validation?: Record<string, any>;
    textFieldsCount?: number;
    order: number;
  }[];
}

export interface UpdateSectionTypeRequest extends Partial<CreateSectionTypeRequest> {}

export interface CreateSectionRequest {
  name: string;
  link: string;
  content?: any;
  sectionTypeId?: string;
}

export interface UpdateSectionRequest extends Partial<CreateSectionRequest> {} 