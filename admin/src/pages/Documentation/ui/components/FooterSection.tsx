import { Card, CardBody, CardHeader, Input, Button, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import type { DocsConfigData, FooterLink } from '@/services/docsConfigApi'

interface FooterSectionProps {
  config: DocsConfigData
  isModalOpen: boolean
  editingLink: FooterLink | null
  onConfigChange: (field: keyof DocsConfigData, value: any) => void
  onModalOpen: () => void
  onModalClose: () => void
  onAddLink: () => void
  onEditLink: (link: FooterLink) => void
  onSaveLink: (link: FooterLink) => void
  onRemoveLink: (index: number) => void
  onSetEditingLink: (link: FooterLink | null) => void
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  config,
  isModalOpen,
  editingLink,
  onConfigChange,
  onModalOpen,
  onModalClose,
  onAddLink,
  onEditLink,
  onSaveLink,
  onRemoveLink,
  onSetEditingLink
}) => {
  const handleInputChange = (field: keyof DocusaurusConfigData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange(field, e.target.value)
  }

  const handleLinkInputChange = (field: keyof FooterLink) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingLink) {
      onSetEditingLink({
        ...editingLink,
        [field]: e.target.value
      })
    }
  }

  const handleItemInputChange = (index: number, field: 'label' | 'to' | 'href') => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingLink && editingLink.items) {
      const newItems = [...editingLink.items]
      newItems[index] = {
        ...newItems[index],
        [field]: e.target.value
      }
      onSetEditingLink({
        ...editingLink,
        items: newItems
      })
    }
  }

  const handleAddItem = () => {
    if (editingLink) {
      onSetEditingLink({
        ...editingLink,
        items: [...(editingLink.items || []), { label: '', to: '', href: '' }]
      })
    }
  }

  const handleRemoveItem = (index: number) => {
    if (editingLink && editingLink.items) {
      const newItems = editingLink.items.filter((_, i) => i !== index)
      onSetEditingLink({
        ...editingLink,
        items: newItems
      })
    }
  }

  const handleSaveLink = () => {
    if (editingLink) {
      onSaveLink(editingLink)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-xl font-semibold text-foreground">Footer</h2>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Footer Style"
              placeholder="dark, light"
              value={config.footerStyle}
              onChange={handleInputChange('footerStyle')}
              variant="bordered"
              classNames={{
                base: 'dark',
                input: 'dark text-white',
                inputWrapper: 'dark',
                label: 'dark text-foreground/60',
              }}
            />
            
            <Input
              label="Copyright"
              placeholder="Enter copyright text"
              value={config.copyright}
              onChange={handleInputChange('copyright')}
              variant="bordered"
              classNames={{
                base: 'dark',
                input: 'dark text-white',
                inputWrapper: 'dark',
                label: 'dark text-foreground/60',
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-foreground">Footer Links</h3>
              <Button
                color="primary"
                variant="flat"
                onPress={onAddLink}
                className="dark"
              >
                Add Link Group
              </Button>
            </div>
            
            <div className="space-y-2">
              {config.footerLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-content2 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">{link.title}</span>
                    <span className="text-xs text-foreground/60 ml-2">({link.items.length} items)</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => onEditLink(link)}
                      className="dark"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      onPress={() => onRemoveLink(index)}
                      className="dark"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardBody>

      {/* Modal for editing footer link */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} className="dark" size="2xl">
        <ModalContent>
          <ModalHeader className='text-white'>Edit Footer Link Group</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Title"
                placeholder="Enter group title"
                value={editingLink?.title || ''}
                onChange={handleLinkInputChange('title')}
                variant="bordered"
                classNames={{
                  base: 'dark',
                  input: 'dark text-white',
                  inputWrapper: 'dark',
                  label: 'dark text-foreground/60',
                }}
              />
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground">Items</h4>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={handleAddItem}
                    className="dark"
                  >
                    Add Item
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {editingLink?.items?.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <Input
                        label="Label"
                        placeholder="Item label"
                        value={item.label}
                        onChange={handleItemInputChange(index, 'label')}
                        variant="bordered"
                        classNames={{
                          base: 'dark',
                          input: 'dark text-white',
                          inputWrapper: 'dark',
                          label: 'dark text-foreground/60',
                        }}
                      />
                      <Input
                        label="To"
                        placeholder="Internal link"
                        value={item.to || ''}
                        onChange={handleItemInputChange(index, 'to')}
                        variant="bordered"
                        classNames={{
                          base: 'dark',
                          input: 'dark text-white',
                          inputWrapper: 'dark',
                          label: 'dark text-foreground/60',
                        }}
                      />
                      <Input
                        label="Href"
                        placeholder="External link"
                        value={item.href || ''}
                        onChange={handleItemInputChange(index, 'href')}
                        variant="bordered"
                        classNames={{
                          base: 'dark',
                          input: 'dark text-white',
                          inputWrapper: 'dark',
                          label: 'dark text-foreground/60',
                        }}
                      />
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleRemoveItem(index)}
                        className="dark"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onModalClose} className="dark">
              Cancel
            </Button>
            <Button color="primary" onPress={handleSaveLink} className="dark">
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  )
}