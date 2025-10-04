import React from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Input, 
  Textarea, 
  Switch, 
  Button,
  Divider 
} from '@heroui/react';
import { 
  TrashIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  DocumentTextIcon,
  PhotoIcon,
  CodeBracketIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { FieldTypeSelector } from './FieldTypeSelector';
import { ComplexFieldConfig } from './ComplexFieldConfig';


type CreateSectionField = {
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
};

interface FieldCardProps {
  field: CreateSectionField;
  index: number;
  totalFields: number;
  errors: Record<string, string>;
  onUpdate: (updates: Partial<CreateSectionField>) => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({
  field,
  index,
  totalFields,
  errors,
  onUpdate,
  onRemove,
  onMove,
}) => {
  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'CONTENT':
        return DocumentTextIcon;
      case 'IMAGES':
        return PhotoIcon;
      case 'MARKDOWN':
        return CodeBracketIcon;
      case 'COMPLEX':
        return Squares2X2Icon;
      default:
        return DocumentTextIcon;
    }
  };

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case 'CONTENT':
        return 'blue';
      case 'IMAGES':
        return 'green';
      case 'MARKDOWN':
        return 'purple';
      case 'COMPLEX':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-default-50 to-default-100 border border-default-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 bg-gradient-to-r from-default-100 to-default-200 border-b border-default-200">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-${getFieldTypeColor(field.type)}-100 rounded-lg`}>
              {React.createElement(getFieldTypeIcon(field.type), { className: `w-5 h-5 text-${getFieldTypeColor(field.type)}-600` })}
            </div>
            <div>
              <h4 className="font-semibold text-lg text-default-800">
                Field {index + 1}
              </h4>
              <p className="text-sm text-default-500 capitalize">
                {field.type.toLowerCase().replace('_', ' ')} field
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => onMove('up')}
              isDisabled={index === 0}
              className="hover:bg-default-200"
            >
              <ChevronUpIcon className="h-4 w-4" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => onMove('down')}
              isDisabled={index === totalFields - 1}
              className="hover:bg-default-200"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={onRemove}
              className="hover:bg-danger-100"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="pt-6 space-y-6">
        {/* Field Properties */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-medium text-default-700">Field Properties</h5>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Field Name"
              placeholder="e.g., Title, Description, Image"
              value={field.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              isInvalid={!!errors[`field_${index}_name`]}
              errorMessage={errors[`field_${index}_name`]}
              classNames={{
                input: "text-default-800",
                label: "text-default-700 font-medium",
                errorMessage: "text-danger text-sm bg-danger-50 p-2 rounded border border-danger-200 mt-1"
              }}
              description="Choose a descriptive name for this field"
            />
            
            <FieldTypeSelector
              value={field.type}
              onChange={(type) => {
                const updates: Partial<CreateSectionField> = { type };
                
                // Reset withImage if type is not CONTENT
                if (type !== 'CONTENT') {
                  updates.withImage = false;
                }
                
                // Reset multiple if type is not IMAGES and not CONTENT with withImage
                if (type !== 'IMAGES' && !(type === 'CONTENT' && field.withImage)) {
                  updates.multiple = false;
                }
                
                // For COMPLEX type always enable multiple
                if (type === 'COMPLEX') {
                  updates.multiple = true;
                  updates.maxSelection = 5;
                }
                
                onUpdate(updates);
              }}
              isInvalid={!!errors[`field_${index}_type`]}
              errorMessage={errors[`field_${index}_type`]}
            />
          </div>
        </div>

        <Divider />

        {/* Description */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-medium text-default-700">Description</h5>
          </div>
          <Textarea
            label="Field Description"
            placeholder="Describe what this field is used for (optional)"
            value={field.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            classNames={{
              input: "text-default-800",
              label: "text-default-700 font-medium"
            }}
            description="Help content editors understand how to use this field"
          />
        </div>

        <Divider />

        {/* Field Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-medium text-default-700">Field Options</h5>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Switch
                isSelected={field.required}
                onValueChange={(value) => onUpdate({ required: value })}
                classNames={{
                  label: "text-default-700 font-medium"
                }}
              >
                Required Field
              </Switch>
              {field.required && (
                <p className="text-xs text-warning-600 bg-warning-50 p-2 rounded border border-warning-200">
                  ⚠️ Required fields need a default value
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Switch
                isSelected={field.multiple}
                onValueChange={(value) => {
                  onUpdate({ multiple: value });
                  if (!value) {
                    onUpdate({ maxSelection: undefined });
                  }
                }}
                isDisabled={field.type !== 'IMAGES' && !(field.type === 'CONTENT' && field.withImage)}
                classNames={{
                  label: "text-default-700 font-medium"
                }}
              >
                Multiple Values
              </Switch>
              {field.multiple && (
                <p className="text-xs text-info-600 bg-info-50 p-2 rounded border border-info-200">
                  ℹ️ Multiple fields need max selection limit
                </p>
              )}
            </div>
            
            {field.type === 'CONTENT' && (
              <div className="space-y-2">
                <Switch
                  isSelected={field.withImage}
                  onValueChange={(value) => {
                    onUpdate({ withImage: value });
                    if (!value) {
                      onUpdate({ multiple: false });
                    }
                  }}
                  classNames={{
                    label: "text-default-700 font-medium"
                  }}
                >
                  With Image
                </Switch>
                {field.withImage && (
                  <p className="text-xs text-secondary-600 bg-secondary-50 p-2 rounded border border-secondary-200">
                    🖼️ Content fields can include images
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selection Limits */}
        {((field.type === 'IMAGES' && field.multiple) || 
          (field.type === 'CONTENT' && field.withImage && field.multiple) || 
          field.type === 'COMPLEX') && (
          <>
            <Divider />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-medium text-default-700">
                  {field.type === 'COMPLEX' ? 'Array Size Limit' : 'Selection Limits'}
                </h5>
              </div>
              <Input
                label={field.type === 'COMPLEX' ? 'Max Array Items' : 'Max Selection'}
                type="number"
                placeholder={field.type === 'COMPLEX' ? '10' : '10'}
                value={field.maxSelection?.toString() || ''}
                onChange={(e) => onUpdate({ maxSelection: parseInt(e.target.value) || undefined })}
                isInvalid={!!errors[`field_${index}_maxSelection`]}
                errorMessage={errors[`field_${index}_maxSelection`]}
                classNames={{
                  input: "text-default-800",
                  label: "text-default-700 font-medium",
                  errorMessage: "text-danger text-sm bg-danger-50 p-2 rounded border border-danger-200 mt-1"
                }}
                description={`Maximum number of ${field.type === 'COMPLEX' ? 'array items' : 'selections'} allowed`}
              />
            </div>
          </>
        )}

        {/* Default Value */}
        {(field.type === 'IMAGES' || field.type === 'CONTENT' || field.type === 'MARKDOWN') && (
          <>
            <Divider />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-medium text-default-700">Default Content</h5>
              </div>
              <Input
                label="Default Value"
                placeholder={field.required ? "Enter default value (required)" : "Enter default value (optional)"}
                value={field.defaultValue}
                onChange={(e) => onUpdate({ defaultValue: e.target.value })}
                isInvalid={!!errors[`field_${index}_defaultValue`]}
                errorMessage={errors[`field_${index}_defaultValue`]}
                classNames={{
                  input: "text-default-800",
                  label: "text-default-700 font-medium",
                  errorMessage: "text-danger text-sm bg-danger-50 p-2 rounded border border-danger-200 mt-1"
                }}
                description={field.required ? "This field is required and needs a default value" : "Optional default value for this field"}
              />
            </div>
          </>
        )}

        {/* Complex Field Configuration */}
        {field.type === 'COMPLEX' && (
          <>
            <Divider />
            <ComplexFieldConfig
              field={field}
              index={index}
              errors={errors}
              onUpdate={onUpdate}
            />
          </>
        )}
      </CardBody>
    </Card>
  );
};