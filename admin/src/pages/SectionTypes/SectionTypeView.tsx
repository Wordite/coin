import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
} from '@heroui/react';
import type { SectionType } from '../../entities/section/types';

interface SectionTypeViewProps {
  sectionType: SectionType;
  onClose: () => void;
}

const SectionTypeView: React.FC<SectionTypeViewProps> = ({ sectionType, onClose }) => {
  const getFieldTypeColor = (type: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
      CONTENT: 'primary',
      IMAGES: 'secondary',
      MARKDOWN: 'success',
    };
    return colors[type] || 'default';
  };

  const getFieldTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CONTENT: 'Content',
      IMAGES: 'Images',
      MARKDOWN: 'Markdown',
    };
    return labels[type] || type;
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="3xl" scrollBehavior="inside" classNames={{
      base: "dark border text-foreground border-gray-700",
      header: "border-b border-gray-700 text-foreground dark",
      body: "text-foreground dark",
      footer: "border-t border-gray-700 text-foreground dark"
    }}>
      <ModalContent>
        <ModalHeader className="border-b border-default-200 pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-primary-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-default-800">Section Type Details</h2>
            </div>
            <Button
              isIconOnly
              variant="light"
              onPress={onClose}
              className="text-gray-300 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-default-100">
              <CardHeader className="border-b border-default-200 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-6 bg-secondary-500 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-default-800">{sectionType.name}</h3>
                  <Chip
                    size="sm"
                    color={sectionType.color || 'default'}
                    variant="flat"
                    className="mt-2"
                  >
                    {sectionType.name}
                  </Chip>
                </div>
              </CardHeader>
              <CardBody>
                {sectionType.description && (
                  <p className="text-gray-400 mb-4">{sectionType.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{sectionType.fields.length} fields</span>
                  <span>{sectionType._count?.sections ?? 0} sections using this type</span>
                </div>
              </CardBody>
            </Card>

            <Divider className="" />

            {/* Fields */}
            <Card className="bg-default-100">
              <CardHeader className="border-b border-default-200 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-6 bg-success-500 rounded-full"></div>
                  <h3 className="text-lg font-medium text-default-800">Fields</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {sectionType.fields.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No fields defined</p>
                  ) : (
                    sectionType.fields.map((field, index) => (
                      <div key={field.id} className="rounded-lg p-4 bg-default-50 border border-default-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4 p-3 bg-default-100 rounded-lg border border-default-200">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 font-mono">#{index + 1}</span>
                            <h4 className="font-medium text-lg">{field.name}</h4>
                            <Chip
                              size="sm"
                              color={getFieldTypeColor(field.type)}
                              variant="flat"
                            >
                              {getFieldTypeLabel(field.type)}
                            </Chip>
                          </div>
                          <div className="flex items-center gap-2">
                            {field.required && (
                              <Chip size="sm" color="danger" variant="flat">
                                Required
                              </Chip>
                            )}
                            {field.multiple && (
                              <Chip size="sm" color="primary" variant="flat">
                                Multiple
                              </Chip>
                            )}
                            {field.withImage && (
                              <Chip size="sm" color="secondary" variant="flat">
                                With Image
                              </Chip>
                            )}
                          </div>
                        </div>

                        {field.description && (
                          <div className="mb-4 p-3 bg-default-50 rounded-lg border border-default-200">
                            <p className="text-sm text-gray-300">{field.description}</p>
                          </div>
                        )}

                        <div className="p-3 bg-default-50 rounded-lg border border-default-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Order:</span>
                              <span className="ml-1">{field.order}</span>
                            </div>
                            {field.maxSelection && (
                              <div>
                                <span className="text-gray-400">Max Selection:</span>
                                <span className="ml-1">{field.maxSelection}</span>
                              </div>
                            )}
                            {field.defaultValue && (
                              <div>
                                <span className="text-gray-400">Default:</span>
                                <span className="ml-1">{field.defaultValue}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-400">ID:</span>
                              <span className="ml-1 font-mono text-xs">{field.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Sections Using This Type */}
            {sectionType.sections && sectionType.sections.length > 0 && (
              <>
                <Divider className="" />
                <Card className="bg-default-100">
                  <CardHeader className="border-b border-default-200 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-6 bg-warning-500 rounded-full"></div>
                      <h3 className="text-lg font-medium text-default-800">Sections Using This Type</h3>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {sectionType.sections.map((section) => (
                        <div key={section.id} className="flex justify-between items-center p-3 rounded-lg bg-default-50 border border-default-200 shadow-sm">
                          <div>
                            <p className="font-medium">{section.name}</p>
                            <p className="text-sm text-gray-400">{section.link}</p>
                          </div>
                          <Chip size="sm" variant="flat">
                            {section.id}
                          </Chip>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SectionTypeView; 