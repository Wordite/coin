import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea } from '@heroui/react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import ImagePicker from '@/widgets/ImagePicker';
import type { MediaFile } from '../../pages/MediaLibrary/model';

interface ComplexItem {
  [key: string]: string | undefined;
}

interface ComplexArrayEditorProps {
  fieldName: string;
  maxItems: number;
  content: Record<string, string>;
  images: Record<string, MediaFile[]>;
  onUpdate: (data: ComplexItem[]) => void;
  fieldConfig?: {
    enableFirstInput?: boolean;
    enableSecondInput?: boolean;
    enableImage?: boolean;
    firstInputLabel?: string;
    secondInputLabel?: string;
    imageLabel?: string;
    textFieldsCount?: number;
    [key: string]: any;
  };
}

interface ComplexArrayEditorProps {
  fieldName: string;
  maxItems: number;
  content: Record<string, string>;
  images: Record<string, MediaFile[]>;
  onUpdate: (data: ComplexItem[]) => void;
}

export const ComplexArrayEditor: React.FC<ComplexArrayEditorProps> = ({
  fieldName,
  maxItems,
  content,
  images,
  onUpdate,
  fieldConfig,
}) => {
  const [items, setItems] = useState<ComplexItem[]>([]);

  useEffect(() => {
    // Загружаем существующие данные
    const existingData = content[fieldName];
    if (existingData) {
      try {
        const parsed = JSON.parse(existingData);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      } catch (e) {
        console.error('Failed to parse complex field data:', e);
      }
    }
  }, [fieldName, content]);

  const addItem = () => {
    if (items.length >= maxItems) {
      alert(`Maximum ${maxItems} items allowed`);
      return;
    }
    
    const newItem: ComplexItem = {};
    
    // Добавляем текстовые поля в зависимости от textFieldsCount
    const textFieldsCount = fieldConfig?.textFieldsCount || 2;
    for (let i = 1; i <= textFieldsCount; i++) {
      if (i === 1 && fieldConfig?.enableFirstInput !== false) {
        newItem[`textField${i}`] = '';
      } else if (i === 2 && fieldConfig?.enableSecondInput !== false) {
        newItem[`textField${i}`] = '';
      } else if (i > 2) {
        // Проверяем, включено ли дополнительное поле
        const isEnabled = fieldConfig?.[`enableTextField${i}`] !== false;
        if (isEnabled) {
          newItem[`textField${i}`] = '';
        }
      }
    }
    
    // Добавляем изображение если включено
    if (fieldConfig?.enableImage !== false) {
      newItem.image = '';
    }
    
    const newItems = [...items, newItem];
    setItems(newItems);
    onUpdate(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onUpdate(newItems);
  };

  const updateItem = (index: number, field: keyof ComplexItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    onUpdate(newItems);
  };

  const updateItemImage = (index: number, imageUrl: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], image: imageUrl };
    setItems(newItems);
    onUpdate(newItems);
  };

  return (
    <div className="space-y-4 bg-1a1a1a p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-d4d4d8">
          Array Items ({items.length}/{maxItems})
        </label>
        <Button
          size="sm"
          color="primary"
          variant="flat"
          startContent={<PlusIcon className="h-4 w-4" />}
          onPress={addItem}
          isDisabled={items.length >= maxItems}
          className="bg-blue-600/10 text-blue-400 border border-blue-600/20 hover:bg-blue-600/20"
        >
          Add Item
        </Button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-a1a1aa">
          <p>No items yet. Click "Add Item" to get started.</p>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="bg-0f0f0f rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-white">Item {index + 1}</h4>
              <Button
                size="sm"
                color="danger"
                variant="light"
                startContent={<TrashIcon className="h-4 w-4" />}
                onPress={() => removeItem(index)}
                className="bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600/20"
              >
                Remove
              </Button>
            </div>

            <div className={`grid gap-4 ${
              (fieldConfig?.textFieldsCount || 2) > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            }`}>
              {/* Рендерим текстовые поля динамически */}
              {Array.from({ length: fieldConfig?.textFieldsCount || 2 }, (_, i) => {
                const fieldIndex = i + 1;
                const fieldKey = `textField${fieldIndex}`;
                const isFirstField = fieldIndex === 1;
                const isSecondField = fieldIndex === 2;
                const isAdditionalField = fieldIndex > 2;
                
                // Проверяем, включено ли поле
                if (isFirstField && fieldConfig?.enableFirstInput === false) return null;
                if (isSecondField && fieldConfig?.enableSecondInput === false) return null;
                if (isAdditionalField && fieldConfig?.[`enableTextField${fieldIndex}`] === false) return null;
                
                const label = isFirstField 
                  ? (fieldConfig?.firstInputLabel || 'First Input')
                  : isSecondField 
                    ? (fieldConfig?.secondInputLabel || 'Second Input')
                    : fieldConfig?.[`textField${fieldIndex}Label`] || `Text Field ${fieldIndex}`;
                
                return (
                  <div key={fieldKey}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <Input
                      placeholder={`Enter ${label.toLowerCase()}...`}
                      value={item[fieldKey] || ''}
                      onChange={(e) => updateItem(index, fieldKey, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>

            {fieldConfig?.enableImage !== false && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {fieldConfig?.imageLabel || 'Image'}
                </label>
                <div className="space-y-2">
                  <ImagePicker
                    onSelect={(selectedImages) => {
                      if (selectedImages.length > 0) {
                        updateItemImage(index, selectedImages[0].url);
                      }
                    }}
                    selectedImages={item.image ? [{ url: item.image } as any] : []}
                    multiple={false}
                    maxSelection={1}
                    placeholder="Select image..."
                  />

                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="text-sm text-a1a1aa text-center mt-4 p-3 bg-2a2a2a rounded-lg">
          {items.length} item{items.length !== 1 ? 's' : ''} • Maximum {maxItems} allowed
        </div>
      )}
    </div>
  );
}; 