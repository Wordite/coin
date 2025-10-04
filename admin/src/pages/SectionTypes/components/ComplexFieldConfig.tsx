import React from 'react';
import { Input, Switch, Card, CardBody, CardHeader } from '@heroui/react';
import { Cog6ToothIcon, PlusIcon } from '@heroicons/react/24/outline';
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

interface ComplexFieldConfigProps {
  field: CreateSectionField;
  index: number;
  errors: Record<string, string>;
  onUpdate: (updates: Partial<CreateSectionField>) => void;
}

export const ComplexFieldConfig: React.FC<ComplexFieldConfigProps> = ({
  field,
  index,
  errors,
  onUpdate,
}) => {
  const updateValidation = (updates: any) => {
    onUpdate({
      validation: {
        ...field.validation,
        ...updates
      }
    });
  };

  const addTextField = () => {
    const currentCount = field.textFieldsCount || 2;
    if (currentCount < 5) {
      onUpdate({ textFieldsCount: currentCount + 1 });
    }
  };

  const removeTextField = () => {
    const currentCount = field.textFieldsCount || 2;
    if (currentCount > 2) {
      onUpdate({ textFieldsCount: currentCount - 1 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-default-200">
        <div>
          <h4 className="text-lg font-semibold text-default-800">Complex Field Configuration</h4>
          <p className="text-sm text-default-500">Configure the fields within your dynamic array</p>
        </div>
      </div>

      {/* Text Fields Count */}
      <Card className="bg-gradient-to-r from-info-50 to-info-100 border border-info-200">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-medium text-default-700">Text Fields Configuration</h5>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="flex items-center gap-3">
            <Input
              type="number"
              label="Number of Text Fields"
              placeholder="2-5"
              min={2}
              max={5}
              value={String(field.textFieldsCount || 2)}
              onChange={(e) => onUpdate({ textFieldsCount: parseInt(e.target.value) || 2 })}
              size="sm"
              classNames={{
                input: "text-default-800",
                label: "text-default-700 font-medium"
              }}
            />
            <div className="flex gap-1">
              <button
                onClick={addTextField}
                disabled={(field.textFieldsCount || 2) >= 5}
                className="p-2 bg-info-500 text-white rounded-lg hover:bg-info-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
              <button
                onClick={removeTextField}
                disabled={(field.textFieldsCount || 2) <= 2}
                className="p-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-sm">−</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-info-600 mt-2">
            Choose how many text input fields to show (2-5). You can add or remove fields as needed.
          </p>
        </CardBody>
      </Card>

      {/* Field Enable/Disable Switches */}
      <Card className="bg-gradient-to-r from-warning-50 to-warning-100 border border-warning-200">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-medium text-default-700">Enable Fields</h5>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-4">
          {/* First Two Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Switch
                isSelected={field.validation?.enableFirstInput !== false}
                onValueChange={(value) => updateValidation({ enableFirstInput: value })}
                classNames={{
                  label: "text-default-700 font-medium"
                }}
              >
                First Input Field
              </Switch>
              {field.validation?.enableFirstInput !== false && (
                <Input
                  label="First Input Label"
                  placeholder="e.g., Title, Name, etc."
                  value={field.validation?.firstInputLabel || 'Title'}
                  onChange={(e) => updateValidation({ firstInputLabel: e.target.value })}
                  size="sm"
                  isInvalid={!!errors[`field_${index}_firstInputLabel`]}
                  errorMessage={errors[`field_${index}_firstInputLabel`]}
                  classNames={{
                    input: "text-default-800",
                    label: "text-default-700 font-medium",
                    errorMessage: "text-danger text-sm bg-danger-50 p-2 rounded border border-danger-200 mt-1"
                  }}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Switch
                isSelected={field.validation?.enableSecondInput !== false}
                onValueChange={(value) => updateValidation({ enableSecondInput: value })}
                classNames={{
                  label: "text-default-700 font-medium"
                }}
              >
                Second Input Field
              </Switch>
              {field.validation?.enableSecondInput !== false && (
                <Input
                  label="Second Input Label"
                  placeholder="e.g., Description, Text, etc."
                  value={field.validation?.secondInputLabel || 'Description'}
                  onChange={(e) => updateValidation({ secondInputLabel: e.target.value })}
                  size="sm"
                  isInvalid={!!errors[`field_${index}_secondInputLabel`]}
                  errorMessage={errors[`field_${index}_secondInputLabel`]}
                  classNames={{
                    input: "text-default-800",
                    label: "text-default-700 font-medium",
                    errorMessage: "text-danger text-sm bg-danger-50 p-2 rounded border border-danger-200 mt-1"
                  }}
                />
              )}
            </div>
          </div>
          
          {/* Additional Text Fields (3-5) */}
          {field.textFieldsCount && field.textFieldsCount > 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h6 className="text-sm font-medium text-default-700">Additional Text Fields</h6>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: field.textFieldsCount - 2 }, (_, i) => {
                  const fieldIndex = i + 3;
                  const fieldKey = `enableTextField${fieldIndex}`;
                  const labelKey = `textField${fieldIndex}Label`;
                  const isEnabled = field.validation?.[fieldKey] !== false;
                  
                  return (
                    <div key={fieldIndex} className="space-y-2">
                      <Switch
                        isSelected={isEnabled}
                        onValueChange={(value) => updateValidation({ [fieldKey]: value })}
                        classNames={{
                          label: "text-default-700 font-medium"
                        }}
                      >
                        Text Field {fieldIndex}
                      </Switch>
                      {isEnabled && (
                        <Input
                          label={`Field ${fieldIndex} Label`}
                          placeholder={`e.g., Field ${fieldIndex}...`}
                          value={field.validation?.[labelKey] || `Field ${fieldIndex}`}
                          onChange={(e) => updateValidation({ [labelKey]: e.target.value })}
                          size="sm"
                          isInvalid={!!errors[`field_${index}_textField${fieldIndex}Label`]}
                          errorMessage={errors[`field_${index}_textField${fieldIndex}Label`]}
                          classNames={{
                            input: "text-default-800",
                            label: "text-default-700 font-medium",
                            errorMessage: "text-danger text-sm bg-danger-50 p-2 rounded border border-danger-200 mt-1"
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Image Field */}
          <div className="space-y-2">
            <Switch
              isSelected={field.validation?.enableImage !== false}
              onValueChange={(value) => updateValidation({ enableImage: value })}
              classNames={{
                label: "text-default-700 font-medium"
              }}
            >
              Image Field
            </Switch>
            {field.validation?.enableImage !== false && (
              <Input
                label="Image Label"
                placeholder="e.g., Icon, Image, etc."
                value={field.validation?.imageLabel || 'Icon'}
                onChange={(e) => updateValidation({ imageLabel: e.target.value })}
                size="sm"
                isInvalid={!!errors[`field_${index}_imageLabel`]}
                errorMessage={errors[`field_${index}_imageLabel`]}
                classNames={{
                  input: "text-default-800",
                  label: "text-default-700 font-medium",
                  errorMessage: "text-danger text-sm bg-danger-50 p-2 rounded border border-danger-200 mt-1"
                }}
              />
            )}
          </div>
        </CardBody>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200">
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Cog6ToothIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h6 className="font-medium text-primary-800 mb-1">Dynamic Array</h6>
              <p className="text-sm text-primary-700">
                Users can add/remove items dynamically when editing content. 
                Set the maximum limit to control the total number of items.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};