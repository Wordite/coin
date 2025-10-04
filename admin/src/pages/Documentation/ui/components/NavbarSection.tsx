import { Card, CardBody, CardHeader, Input, Button, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import type { DocsConfigData, NavbarLink } from '@/services/docsConfigApi'

interface NavbarSectionProps {
  config: DocsConfigData
  isModalOpen: boolean
  editingLink: NavbarLink | null
  onConfigChange: (field: keyof DocsConfigData, value: any) => void
  onModalOpen: () => void
  onModalClose: () => void
  onAddLink: () => void
  onEditLink: (link: NavbarLink) => void
  onSaveLink: (link: NavbarLink) => void
  onRemoveLink: (index: number) => void
  onSetEditingLink: (link: NavbarLink | null) => void
}

export const NavbarSection: React.FC<NavbarSectionProps> = ({
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

  const handleLinkInputChange = (field: keyof NavbarLink) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingLink) {
      onSetEditingLink({
        ...editingLink,
        [field]: e.target.value
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
        <h2 className="text-xl font-semibold text-foreground">Navigation</h2>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Navbar Title"
              placeholder="Enter navbar title"
              value={config.navbarTitle}
              onChange={handleInputChange('navbarTitle')}
              variant="bordered"
              classNames={{
                base: 'dark',
                input: 'dark text-white',
                inputWrapper: 'dark',
                label: 'dark text-foreground/60',
              }}
            />
            
            <Input
              label="Navbar Logo Alt"
              placeholder="Enter logo alt text"
              value={config.navbarLogoAlt}
              onChange={handleInputChange('navbarLogoAlt')}
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
              <h3 className="text-lg font-medium text-foreground">Navbar Links</h3>
              <Button
                color="primary"
                variant="flat"
                onPress={onAddLink}
                className="dark"
              >
                Add Link
              </Button>
            </div>
            
            <div className="space-y-2">
              {config.navbarLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-content2 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">{link.label}</span>
                    <span className="text-xs text-foreground/60 ml-2">({link.type})</span>
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

      {/* Modal for editing navbar link */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} className="dark">
        <ModalContent>
          <ModalHeader className='text-white'>Edit Navbar Link</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Label"
                placeholder="Enter link label"
                value={editingLink?.label || ''}
                onChange={handleLinkInputChange('label')}
                variant="bordered"
                classNames={{
                  base: 'dark',
                  input: 'dark text-white',
                  inputWrapper: 'dark',
                  label: 'dark text-foreground/60',
                }}
              />
              
              <Input
                label="Type"
                placeholder="docSidebar, href, etc."
                value={editingLink?.type || ''}
                onChange={handleLinkInputChange('type')}
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
                placeholder="Enter href (if type is href)"
                value={editingLink?.href || ''}
                onChange={handleLinkInputChange('href')}
                variant="bordered"
                classNames={{
                  base: 'dark',
                  input: 'dark text-white',
                  inputWrapper: 'dark',
                  label: 'dark text-foreground/60',
                }}
              />
              
              <Input
                label="Sidebar ID"
                placeholder="Enter sidebar ID (if type is docSidebar)"
                value={editingLink?.sidebarId || ''}
                onChange={handleLinkInputChange('sidebarId')}
                variant="bordered"
                classNames={{
                  base: 'dark',
                  input: 'dark text-white',
                  inputWrapper: 'dark',
                  label: 'dark text-foreground/60',
                }}
              />
              
              <Input
                label="Position"
                placeholder="left, right"
                value={editingLink?.position || ''}
                onChange={handleLinkInputChange('position')}
                variant="bordered"
                classNames={{
                  base: 'dark',
                  input: 'dark text-white',
                  inputWrapper: 'dark',
                  label: 'dark text-foreground/60',
                }}
              />
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