import React from 'react';
import { Input, Textarea, Select, SelectItem } from '@heroui/react';
import type { CreateSectionTypeRequest } from '../../../entities/section/types';

interface BasicInfoSectionProps {
  formData: CreateSectionTypeRequest;
  errors: Record<string, string>;
  onUpdate: (updates: Partial<CreateSectionTypeRequest>) => void;
}

const colorOptions = [
  { key: 'default', label: 'Gray', color: 'gray' },
  { key: 'primary', label: 'Blue', color: 'blue' },
  { key: 'secondary', label: 'Purple', color: 'purple' },
  { key: 'success', label: 'Green', color: 'green' },
  { key: 'warning', label: 'Yellow', color: 'yellow' },
  { key: 'danger', label: 'Red', color: 'red' },
];

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  errors,
  onUpdate,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-default-200">
        <div>
          <h3 className="text-lg font-semibold text-default-800">Basic Information</h3>
          <p className="text-sm text-default-500">Configure the basic properties of your section type</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        <Input
          label="Section Type Name"
          placeholder="e.g., Hero Section, About Us, Features"
          value={formData.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          isInvalid={!!errors.name}
          errorMessage={errors.name}
          classNames={{
            input: "text-default-800",
            label: "text-default-700 font-medium",
            errorMessage: "text-danger text-sm bg-danger-50 p-2 rounded border border-danger-200 mt-1"
          }}
          description="Choose a descriptive name for your section type"
        />

        <Textarea
          label="Description"
          placeholder="Describe what this section type is used for (optional)"
          value={formData.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          classNames={{
            input: "text-default-800",
            label: "text-default-700 font-medium"
          }}
          description="Help other users understand when to use this section type"
        />
        
        {/* Color Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-default-700">Visual Styling</h4>
          </div>
          
          <Select
            label="Theme Color"
            placeholder="Select a color theme"
            selectedKeys={formData.color ? [formData.color] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              onUpdate({ color: selectedKey as any });
            }}
            classNames={{
              trigger: "bg-default-50 border-default-200",
              label: "text-default-700 font-medium"
            }}
            description="Choose a color theme for this section type"
          >
            {colorOptions.map((option) => {
              const getColorClass = (color: string) => {
                switch (color) {
                  case 'gray': return 'bg-gray-500';
                  case 'blue': return 'bg-blue-500';
                  case 'purple': return 'bg-purple-500';
                  case 'green': return 'bg-green-500';
                  case 'yellow': return 'bg-yellow-500';
                  case 'red': return 'bg-red-500';
                  default: return 'bg-gray-500';
                }
              };
              
              return (
                <SelectItem key={option.key} textValue={option.label}>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getColorClass(option.color)} shadow-sm`}></div>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </Select>
          
          {formData.color && formData.color !== 'default' && (
            <div className="p-3 bg-gradient-to-r from-default-50 to-default-100 border border-default-200 rounded-lg">
              <div className="flex items-center gap-3">
                {(() => {
                  const selectedOption = colorOptions.find(opt => opt.key === formData.color);
                  const getColorClass = (color: string) => {
                    switch (color) {
                      case 'gray': return 'bg-gray-500';
                      case 'blue': return 'bg-blue-500';
                      case 'purple': return 'bg-purple-500';
                      case 'green': return 'bg-green-500';
                      case 'yellow': return 'bg-yellow-500';
                      case 'red': return 'bg-red-500';
                      default: return 'bg-gray-500';
                    }
                  };
                  
                  return (
                    <>
                      <div className={`w-5 h-5 rounded-full ${getColorClass(selectedOption?.color || 'gray')} shadow-sm`}></div>
                      <div>
                        <span className="text-sm font-medium text-default-700">
                          {selectedOption?.label} Theme
                        </span>
                        <p className="text-xs text-default-500">This color will be used for visual elements</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};