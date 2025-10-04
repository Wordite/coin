import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button, Card, CardBody, CardHeader, Divider, Spinner, Chip } from '@heroui/react';
import { sectionApi } from '../../services/sectionApi';
import { Notify } from '../../services/notify';
import type { SectionType, CreateSectionTypeRequest } from '../../entities/section/types';
import SectionTypeForm from './SectionTypeForm';
import SectionTypeView from './SectionTypeView';

const SectionTypes: React.FC = () => {
  const [sectionTypes, setSectionTypes] = useState<SectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSectionType, setEditingSectionType] = useState<SectionType | null>(null);
  const [viewingSectionType, setViewingSectionType] = useState<SectionType | null>(null);

  useEffect(() => {
    loadSectionTypes();
  }, []);

  const loadSectionTypes = async () => {
    try {
      setLoading(true);
      const data = await sectionApi.getSectionTypes();
      setSectionTypes(data);
    } catch (err) {
      Notify.error('Failed to load section types');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateSectionTypeRequest) => {
    try {
      const newSectionType = await sectionApi.createSectionType(data);
      console.log('Created section type:', newSectionType);
      const sectionData = {
        name: data.name,
        link: data.name.toLowerCase().replace(/\s+/g, '-'),
        content: {},
        sectionTypeId: newSectionType.id
      };
      console.log('Creating section with data:', sectionData);
      const newSection = await sectionApi.createSection(sectionData);
      console.log('Created section:', newSection);
      setShowForm(false);
      loadSectionTypes();
      Notify.success('Section type created successfully');
    } catch (err) {
      Notify.error('Failed to create section type');
      console.error(err);
    }
  };

  const handleUpdate = async (id: string, data: CreateSectionTypeRequest) => {
    try {
      await sectionApi.updateSectionType(id, data);
      setShowForm(false);
      setEditingSectionType(null);
      loadSectionTypes();
      Notify.success('Section type updated successfully');
    } catch (err) {
      Notify.error('Failed to update section type');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section type? This will also delete all sections using this type.')) {
      return;
    }

    try {
      await sectionApi.deleteSectionType(id);
      loadSectionTypes();
      Notify.success('Section type deleted successfully');
    } catch (err) {
      Notify.error('Failed to delete section type');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Section Types</h1>
        <Button
          color="primary"
          startContent={<PlusIcon className="h-5 w-5" />}
          onPress={() => setShowForm(true)}
        >
          Create Section Type
        </Button>
      </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-white">Available Section Types</h2>
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            {sectionTypes.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No section types found. Create your first one!
              </div>
            ) : (
              sectionTypes.map((type) => (
                <div key={type.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-white">{type.name}</h3>
                      <Chip
                        size="sm"
                        color={type.color || 'default'}
                        variant="flat"
                      >
                        {type.name}
                      </Chip>
                    </div>
                    {type.description && (
                      <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{type.fields.length} fields</span>
                      <span>{type._count?.sections ?? 0} sections using this type</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      isIconOnly
                      variant="light"
                      color="primary"
                      onPress={() => setViewingSectionType(type)}
                      title="View details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Button>
                    <Button
                      isIconOnly
                      variant="light"
                      color="default"
                      onPress={() => setEditingSectionType(type)}
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Button>
                    <Button
                      isIconOnly
                      variant="light"
                      color="danger"
                      onPress={() => handleDelete(type.id)}
                      title="Delete"
                      isDisabled={type._count?.sections > 0}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>

      {/* Create/Edit Form Modal */}
      {(showForm || editingSectionType) && (
        <SectionTypeForm
          sectionType={editingSectionType}
          onSubmit={editingSectionType ? (data) => handleUpdate(editingSectionType.id, data) : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingSectionType(null);
          }}
        />
      )}

      {/* View Modal */}
      {viewingSectionType && (
        <SectionTypeView
          sectionType={viewingSectionType}
          onClose={() => setViewingSectionType(null)}
        />
      )}

      <div className="mt-6 text-center text-sm text-gray-400">
        <p>When you create a section type, an empty section is automatically created in Contents</p>
        <p className="mt-1">You can then edit the content of these sections in the Page Editor</p>
      </div>
    </div>
  );
};

export default SectionTypes; 