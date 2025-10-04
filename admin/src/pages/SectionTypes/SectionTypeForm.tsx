import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
} from '@heroui/react';
import { BasicInfoSection } from './components/BasicInfoSection';
import { FieldsManager } from './components/FieldsManager';
import type { SectionType, CreateSectionTypeRequest } from '../../entities/section/types';

type CreateSectionField = CreateSectionTypeRequest['fields'][0];

interface SectionTypeFormProps {
  sectionType?: SectionType | null;
  onSubmit: (data: CreateSectionTypeRequest) => void;
  onCancel: () => void;
}

const SectionTypeForm: React.FC<SectionTypeFormProps> = ({
  sectionType,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateSectionTypeRequest>({
    name: '',
    description: '',
    color: 'default',
    fields: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (sectionType) {
      setFormData({
        name: sectionType.name,
        description: sectionType.description || '',
        color: sectionType.color || 'default',
        fields: sectionType.fields.map(field => ({
          name: field.name,
          type: field.type,
          description: field.description || '',
          required: field.required,
          multiple: field.multiple,
          withImage: field.withImage || false,
          maxSelection: field.maxSelection,
          defaultValue: field.defaultValue || '',
          validation: field.validation || {},
          textFieldsCount: field.textFieldsCount,
          order: field.order,
        })),
      });
    }
  }, [sectionType]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.fields.length === 0) {
      newErrors.fields = 'At least one field is required';
    }

    formData.fields.forEach((field, index) => {
      if (!field.name.trim()) {
        newErrors[`field_${index}_name`] = 'Field name is required';
      }
      
      if (field.required && field.type === 'CONTENT' && !field.withImage && !field.defaultValue?.trim()) {
        newErrors[`field_${index}_defaultValue`] = 'Default value is required for required content fields';
      }
      
      if (field.required && field.type === 'MARKDOWN' && !field.defaultValue?.trim()) {
        newErrors[`field_${index}_defaultValue`] = 'Default value is required for required markdown fields';
      }
      
      if (field.required && field.type === 'IMAGES' && !field.defaultValue?.trim()) {
        newErrors[`field_${index}_defaultValue`] = 'Default value is required for required image fields';
      }
      
      if (field.type === 'COMPLEX' && field.required) {
        // Проверяем только включенные поля
        if (field.validation?.enableFirstInput !== false && !field.validation?.firstInputLabel?.trim()) {
          newErrors[`field_${index}_firstInputLabel`] = 'First input label is required when first input field is enabled';
        }
        if (field.validation?.enableSecondInput !== false && !field.validation?.secondInputLabel?.trim()) {
          newErrors[`field_${index}_secondInputLabel`] = 'Second input label is required when second input field is enabled';
        }
        if (field.validation?.enableImage !== false && !field.validation?.imageLabel?.trim()) {
          newErrors[`field_${index}_imageLabel`] = 'Image label is required when image field is enabled';
        }
        
        // Валидация для дополнительных полей (3-5)
        if (field.textFieldsCount && field.textFieldsCount > 2) {
          for (let i = 3; i <= field.textFieldsCount; i++) {
            if (field.validation?.[`enableTextField${i}`] !== false && !field.validation?.[`textField${i}Label`]?.trim()) {
              newErrors[`field_${index}_textField${i}Label`] = `Field ${i} label is required when field ${i} is enabled`;
            }
          }
        }
        if (!field.maxSelection) {
          newErrors[`field_${index}_maxSelection`] = 'Max array items is required for complex fields';
        }
        
        // Проверяем, что хотя бы одно поле включено
        let hasEnabledFields = (
          (field.validation?.enableFirstInput !== false) ||
          (field.validation?.enableSecondInput !== false) ||
          (field.validation?.enableImage !== false)
        );
        
        // Проверяем дополнительные поля (3-5)
        if (field.textFieldsCount && field.textFieldsCount > 2) {
          for (let i = 3; i <= field.textFieldsCount; i++) {
            if (field.validation?.[`enableTextField${i}`] !== false) {
              hasEnabledFields = true;
              break;
            }
          }
        }
        
        if (!hasEnabledFields) {
          newErrors[`field_${index}_fields`] = 'At least one field must be enabled for complex fields';
        }
      }
      
      if (field.type === 'IMAGES' && field.multiple && !field.maxSelection) {
        newErrors[`field_${index}_maxSelection`] = 'Max selection is required for multiple images';
      }
      if (field.type === 'CONTENT' && field.withImage && field.multiple && !field.maxSelection) {
        newErrors[`field_${index}_maxSelection`] = 'Max selection is required for multiple content with images';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const addField = () => {
    const newField = {
      name: '',
      type: 'CONTENT' as const,
      description: '',
      required: false,
      multiple: false,
      withImage: false,
      maxSelection: undefined,
      defaultValue: '',
      validation: {},
      order: formData.fields.length,
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const addComplexField = () => {
    const newField = {
      name: '',
      type: 'COMPLEX' as const,
      description: '',
      required: false,
      multiple: true,
      withImage: false,
      maxSelection: 5,
      defaultValue: '',
      validation: {
        enableFirstInput: true,
        enableSecondInput: true,
        enableImage: true,
        firstInputLabel: 'Title',
        secondInputLabel: 'Description',
        imageLabel: 'Icon',
      },
      textFieldsCount: 2,
      order: formData.fields.length,
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const removeField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const updateField = (index: number, updates: Partial<CreateSectionField>) => {
    setFormData(prev => {
      const newFields = [...prev.fields];
      newFields[index] = { ...newFields[index], ...updates };
      return { ...prev, fields: newFields };
    });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData.fields.length - 1) return;

    setFormData(prev => {
      const newFields = [...prev.fields];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      
      // Обновляем порядок
      newFields[index].order = index;
      newFields[newIndex].order = newIndex;

      return { ...prev, fields: newFields };
    });
  };



  return (
    <Modal 
      isOpen={true} 
      onClose={onCancel} 
      size="5xl" 
      scrollBehavior="inside" 
      classNames={{
        base: "dark border text-foreground border-gray-700",
        header: "border-b border-gray-700 text-foreground dark",
        body: "text-foreground dark",
        footer: "border-t border-gray-700 text-foreground dark"
      }}
    >
      <ModalContent>
        <ModalHeader className="border-b border-default-200 pb-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-semibold text-default-800">
                {sectionType ? 'Edit Section Type' : 'Create Section Type'}
              </h2>
              <p className="text-sm text-default-500">
                {sectionType ? 'Update your section type configuration' : 'Define a new section type with custom fields'}
              </p>
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody className="p-6">
          <div className="space-y-8">
            {/* Basic Information Section */}
            <BasicInfoSection
              formData={formData}
              errors={errors}
              onUpdate={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
            />

            <Divider />

            {/* Fields Management Section */}
            <FieldsManager
              fields={formData.fields}
              errors={errors}
              onAddField={addField}
              onAddComplexField={addComplexField}
              onUpdateField={updateField}
              onRemoveField={removeField}
              onMoveField={moveField}
            />
          </div>
        </ModalBody>
        
        <ModalFooter className="border-t border-default-200 pt-4">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-default-500">
              When you create a section type, an empty section is automatically created in Contents.
            </div>
            <div className="flex gap-3">
              <Button variant="light" onPress={onCancel} className="font-medium">
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit}
                className="font-medium px-6"
              >
                {sectionType ? 'Update Section Type' : 'Create Section Type'}
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SectionTypeForm; 