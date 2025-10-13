import { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Chip,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Pagination,
  Input,
} from '@heroui/react'
import {
  EnvelopeIcon,
  EyeIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { contactApi, type ContactResponse } from '@/services/contactApi'
import { useAuthNotify } from '@/hooks/useAuthNotify'

const Contacts = () => {
  const [contacts, setContacts] = useState<ContactResponse[]>([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const { error: notifyError } = useAuthNotify()
  const [deletingAllRead, setDeletingAllRead] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactResponse | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalRead, setTotalRead] = useState(0)
  const [search, setSearch] = useState('')
  const [isReadFilter, setIsReadFilter] = useState<boolean | undefined>(undefined)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteConfirmOpen, onOpen: onDeleteConfirmOpen, onClose: onDeleteConfirmClose } = useDisclosure()

  useEffect(() => {
    loadContactsData()
    loadReadCount()
  }, [])

  const loadReadCount = async () => {
    try {
      const count = await contactApi.getReadCount()
      setTotalRead(count)
    } catch (err) {
      console.error('Failed to load read count:', err)
    }
  }

  useEffect(() => {
    loadContactsData()
  }, [currentPage, search, isReadFilter])

  const loadContactsData = async () => {
    try {
      setContactsLoading(true)
      const data = await contactApi.getContacts(currentPage, 10, search || undefined, isReadFilter)
      setContacts(data.contacts)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      notifyError('Failed to load contacts')
      console.error(err)
    } finally {
      setContactsLoading(false)
    }
  }

  const handleViewContact = async (id: string) => {
    try {
      const contact = await contactApi.getContactById(id)
      if (contact) {
        setSelectedContact(contact)
        onOpen()
      }
    } catch (err) {
      notifyError('Failed to load contact details')
      console.error(err)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await contactApi.markAsRead(id)
      Notify.success('Contact marked as read')
      loadContactsData()
      loadReadCount()
    } catch (err) {
      notifyError('Failed to mark contact as read')
      console.error(err)
    }
  }

  const handleMarkAsUnread = async (id: string) => {
    try {
      await contactApi.markAsUnread(id)
      Notify.success('Contact marked as unread')
      loadContactsData()
      loadReadCount()
    } catch (err) {
      notifyError('Failed to mark contact as unread')
      console.error(err)
    }
  }

  const handleDeleteContact = async (id: string) => {
    try {
      await contactApi.deleteContact(id)
      Notify.success('Contact deleted successfully')
      loadContactsData()
      loadReadCount()
    } catch (err) {
      notifyError('Failed to delete contact')
      console.error(err)
    }
  }

  const handleDeleteAllRead = async () => {
    try {
      setDeletingAllRead(true)
      const result = await contactApi.deleteAllRead()
      Notify.success(`Successfully deleted ${result.deletedCount} read contacts`)
      loadContactsData()
      loadReadCount()
      onDeleteConfirmClose()
    } catch (err) {
      notifyError('Failed to delete read contacts')
      console.error(err)
    } finally {
      setDeletingAllRead(false)
    }
  }

  const handleDeleteAllReadConfirm = () => {
    onDeleteConfirmOpen()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (filter: boolean | undefined) => {
    setIsReadFilter(filter)
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contact Messages</h1>
          <p className="text-foreground/60 mt-1">Manage contact form submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Chip color="primary" variant="flat" size="sm">
            Total: {total}
          </Chip>
          <Button
            color="danger"
            variant="flat"
            size="sm"
            startContent={<TrashIcon className="w-4 h-4" />}
            onPress={handleDeleteAllReadConfirm}
            isDisabled={totalRead === 0}
          >
            Delete All Read
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search contacts..."
              value={search}
              onValueChange={handleSearchChange}
              startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
              className="max-w-xs"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isReadFilter === undefined ? 'solid' : 'flat'}
                color="primary"
                onPress={() => handleFilterChange(undefined)}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={isReadFilter === false ? 'solid' : 'flat'}
                color="warning"
                onPress={() => handleFilterChange(false)}
              >
                Unread
              </Button>
              <Button
                size="sm"
                variant={isReadFilter === true ? 'solid' : 'flat'}
                color="success"
                onPress={() => handleFilterChange(true)}
              >
                Read
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <EnvelopeIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Contact Messages</h2>
              <p className="text-sm text-foreground/60">All contact form submissions</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Contacts table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>PHONE</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn className="text-right">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {contactsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-foreground/60">Loading contacts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contact.name} {contact.lastName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{contact.email}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{contact.phone || 'No phone'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground/60">
                        {formatDate(contact.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        color={contact.isRead ? 'success' : 'warning'} 
                        variant="flat" 
                        size="sm"
                      >
                        {contact.isRead ? 'Read' : 'Unread'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="flat"
                          startContent={<EyeIcon className="w-4 h-4" />}
                          onPress={() => handleViewContact(contact.id)}
                        >
                          View
                        </Button>
                        {contact.isRead ? (
                          <Button
                            size="sm"
                            color="warning"
                            variant="flat"
                            startContent={<XMarkIcon className="w-4 h-4" />}
                            onPress={() => handleMarkAsUnread(contact.id)}
                          >
                            Unread
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            color="success"
                            variant="flat"
                            startContent={<CheckIcon className="w-4 h-4" />}
                            onPress={() => handleMarkAsRead(contact.id)}
                          >
                            Read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          startContent={<TrashIcon className="w-4 h-4" />}
                          onPress={() => handleDeleteContact(contact.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          {contactsLoading && <Spinner size="sm" />}
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            showControls
            isDisabled={contactsLoading}
          />
        </div>
      )}

      {/* Contact Details Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="4xl" 
        scrollBehavior="inside"
        classNames={{
          base: "dark text-foreground bg-content1 rounded-lg",
          header: "dark text-foreground bg-content1 rounded-t-lg",
          body: "dark text-foreground bg-content1",
          footer: "dark text-foreground bg-content1 rounded-b-lg",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-5 h-5" />
                  Contact Details
                </div>
                {selectedContact && (
                  <p className="text-sm text-foreground/60 font-normal">
                    {selectedContact.name} {selectedContact.lastName} • {selectedContact.email}
                  </p>
                )}
              </ModalHeader>
              <ModalBody>
                {selectedContact && (
                  <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Contact Information</h3>
                        <div className="space-y-2 text-sm">
                          <div><strong>Name:</strong> {selectedContact.name} {selectedContact.lastName}</div>
                          <div><strong>Email:</strong> {selectedContact.email}</div>
                          <div><strong>Phone:</strong> {selectedContact.phone || 'No phone provided'}</div>
                          <div><strong>Date:</strong> {formatDate(selectedContact.createdAt)}</div>
                          <div><strong>Status:</strong> 
                            <Chip 
                              color={selectedContact.isRead ? 'success' : 'warning'} 
                              variant="flat" 
                              size="sm" 
                              className="ml-2"
                            >
                              {selectedContact.isRead ? 'Read' : 'Unread'}
                            </Chip>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">Message</h3>
                        <div className="p-3 bg-content2 rounded-lg text-sm">
                          {selectedContact.message}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete All Read Confirmation Modal */}
      <Modal 
        isOpen={isDeleteConfirmOpen} 
        onClose={onDeleteConfirmClose} 
        size="md"
        classNames={{
          base: "dark text-foreground bg-content1 rounded-lg",
          header: "dark text-foreground bg-content1 rounded-t-lg",
          body: "dark text-foreground bg-content1",
          footer: "dark text-foreground bg-content1 rounded-b-lg",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <TrashIcon className="w-5 h-5 text-danger" />
                  Delete All Read Contacts
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-3">
                  <p className="text-foreground/80">
                    Are you sure you want to delete all read contacts? This action cannot be undone.
                  </p>
                  <div className="p-3 bg-danger/10 rounded-lg">
                    <p className="text-sm text-danger font-medium">
                      This will permanently delete {totalRead} read contact(s).
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose} isDisabled={deletingAllRead}>
                  Cancel
                </Button>
                <Button 
                  color="danger" 
                  onPress={handleDeleteAllRead}
                  isLoading={deletingAllRead}
                  isDisabled={deletingAllRead}
                >
                  {deletingAllRead ? 'Deleting...' : 'Delete All Read'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export { Contacts }
