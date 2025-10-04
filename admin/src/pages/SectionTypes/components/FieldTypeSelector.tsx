import React from 'react';
import { Select, SelectItem, Card, CardBody } from '@heroui/react';
import { 
  DocumentTextIcon, 
  PhotoIcon, 
  CodeBracketIcon, 
  Squares2X2Icon 
} from '@heroicons/react/24/outline';

interface FieldTypeSelectorProps {
  value: 'CONTENT' | 'IMAGES' | 'MARKDOWN' | 'COMPLEX';
  onChange: (type: 'CONTENT' | 'IMAGES' | 'MARKDOWN' | 'COMPLEX') => void;
  isInvalid?: boolean;
  errorMessage?: string;
}

const fieldTypes = [
  {
    key: 'CONTENT' as const,
    label: 'Text Content',
    description: 'Simple text input field',
    icon: DocumentTextIcon,
    color: 'blue',
    features: ['Single line text', 'Optional image', 'Multiple values']
  },
  {
    key: 'IMAGES' as const,
    label: 'Image Gallery',
    description: 'Upload and manage images',
    icon: PhotoIcon,
    color: 'green',
    features: ['Image upload', 'Multiple images', 'Gallery view']
  },
  {
    key: 'MARKDOWN' as const,
    label: 'Rich Text',
    description: 'Markdown formatted content',
    icon: CodeBracketIcon,
    color: 'purple',
    features: ['Rich formatting', 'Markdown support', 'Preview mode']
  },
  {
    key: 'COMPLEX' as const,
    label: 'Complex Array',
    description: 'Dynamic array with multiple fields',
    icon: Squares2X2Icon,
    color: 'orange',
    features: ['Multiple inputs', 'Image support', 'Dynamic array']
  }
];

export const FieldTypeSelector: React.FC<FieldTypeSelectorProps> = ({
  value,
  onChange,
  isInvalid,
  errorMessage
}) => {
  const selectedType = fieldTypes.find(type => type.key === value);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-default-700">Field Type</h4>
      </div>
      
      <Select
        label="Choose Field Type"
        placeholder="Select a field type"
        selectedKeys={[value]}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string;
          onChange(selectedKey as any);
        }}
        isInvalid={isInvalid}
        errorMessage={errorMessage}
        classNames={{
          trigger: "bg-default-50 border-default-200",
          label: "text-default-700 font-medium",
          errorMessage: "text-danger text-sm bg-danger-50 p-2 rounded border border-danger-200 mt-1"
        }}
        description="Choose the type of content this field will handle"
      >
        {fieldTypes.map((type) => (
          <SelectItem key={type.key} textValue={type.label}>
            <div className="flex items-center gap-3">
              <type.icon className={`w-5 h-5 text-${type.color}-500`} />
              <div>
                <span className="font-medium">{type.label}</span>
                <p className="text-xs text-default-500">{type.description}</p>
              </div>
            </div>
          </SelectItem>
        ))}
      </Select>

      {/* Type Preview */}
      {selectedType && (
        <Card className="bg-gradient-to-r from-default-50 to-default-100 border border-default-200">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 bg-${selectedType.color}-100 rounded-lg`}>
                <selectedType.icon className={`w-5 h-5 text-${selectedType.color}-600`} />
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-default-800">{selectedType.label}</h5>
                <p className="text-sm text-default-600 mb-2">{selectedType.description}</p>
                <div className="flex flex-wrap gap-1">
                  {selectedType.features.map((feature, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-default-200 text-xs text-default-600 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};