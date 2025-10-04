import React from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { PlusIcon, Squares2X2Icon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { FieldCard } from './FieldCard';
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

interface FieldsManagerProps {
  fields: CreateSectionField[];
  errors: Record<string, string>;
  onAddField: () => void;
  onAddComplexField: () => void;
  onUpdateField: (index: number, updates: Partial<CreateSectionField>) => void;
  onRemoveField: (index: number) => void;
  onMoveField: (index: number, direction: 'up' | 'down') => void;
}

export const FieldsManager: React.FC<FieldsManagerProps> = ({
  fields,
  errors,
  onAddField,
  onAddComplexField,
  onUpdateField,
  onRemoveField,
  onMoveField,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg font-semibold text-default-800">Fields Configuration</h3>
            <p className="text-sm text-default-500">Define the content fields for your section type</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="flat"
            startContent={<DocumentTextIcon className="h-4 w-4" />}
            onPress={onAddField}
            className="font-medium"
          >
            Add Field
          </Button>
          <Button
            color="secondary"
            variant="flat"
            startContent={<Squares2X2Icon className="h-4 w-4" />}
            onPress={onAddComplexField}
            className="font-medium"
          >
            Add Complex Field
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {errors.fields && (
        <Card className="bg-gradient-to-r from-danger-50 to-danger-100 border border-danger-200">
          <CardBody className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-danger-500 rounded-full"></div>
              <p className="text-danger text-sm font-medium">{errors.fields}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Fields List */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <Card className="bg-gradient-to-r from-default-50 to-default-100 border border-default-200">
            <CardBody className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-default-200 rounded-full">
                  <DocumentTextIcon className="h-8 w-8 text-default-500" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-default-700 mb-2">No Fields Added Yet</h4>
                  <p className="text-sm text-default-500 mb-4">
                    Add fields to define what content editors can input for this section type.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      color="primary"
                      variant="flat"
                      startContent={<DocumentTextIcon className="h-4 w-4" />}
                      onPress={onAddField}
                    >
                      Add Simple Field
                    </Button>
                    <Button
                      color="secondary"
                      variant="flat"
                      startContent={<Squares2X2Icon className="h-4 w-4" />}
                      onPress={onAddComplexField}
                    >
                      Add Complex Field
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : (
          fields.map((field, index) => (
            <FieldCard
              key={index}
              field={field}
              index={index}
              totalFields={fields.length}
              errors={errors}
              onUpdate={(updates) => onUpdateField(index, updates)}
              onRemove={() => onRemoveField(index)}
              onMove={(direction) => onMoveField(index, direction)}
            />
          ))
        )}
      </div>

      {/* Quick Actions */}
      {fields.length > 0 && (
        <Card className="bg-gradient-to-r from-success-50 to-success-100 border border-success-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-100 rounded-lg">
                  <PlusIcon className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <h5 className="font-medium text-success-800">Quick Actions</h5>
                  <p className="text-sm text-success-600">Add more fields to your section type</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  color="success"
                  variant="flat"
                  size="sm"
                  startContent={<DocumentTextIcon className="h-4 w-4" />}
                  onPress={onAddField}
                >
                  Add Field
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  size="sm"
                  startContent={<Squares2X2Icon className="h-4 w-4" />}
                  onPress={onAddComplexField}
                >
                  Add Complex
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};