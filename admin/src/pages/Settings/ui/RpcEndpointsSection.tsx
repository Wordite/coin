import React, { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Select, SelectItem } from '@heroui/react'
import type { PresaleSettingsSectionProps } from '../model/types'
import { coinApi } from '../../../services/coinApi'

interface RpcEndpoint {
  url: string
  priority: number
  name: string
}

export const RpcEndpointsSection: React.FC<PresaleSettingsSectionProps> = ({
  presaleSettings,
  setPresaleSettings
}) => {
  const [endpoints, setEndpoints] = useState<RpcEndpoint[]>([])
  const [newEndpoint, setNewEndpoint] = useState<RpcEndpoint>({
    url: '',
    priority: 1,
    name: ''
  })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [primaryRpc, setPrimaryRpc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  useEffect(() => {
    // Initialize endpoints from presaleSettings
    if (presaleSettings.rpcEndpoints && Array.isArray(presaleSettings.rpcEndpoints)) {
      setEndpoints(presaleSettings.rpcEndpoints)
    }
    if (presaleSettings.rpc) {
      setPrimaryRpc(presaleSettings.rpc)
    }
  }, [presaleSettings.rpcEndpoints, presaleSettings.rpc])

  const handleAddEndpoint = async () => {
    if (!newEndpoint.url || !newEndpoint.name) {
      return
    }

    setIsLoading(true)
    try {
      const updatedEndpoints = [...endpoints, newEndpoint]
      
      // Save to server
      await coinApi.updateRpcEndpoints(updatedEndpoints)
      
      setEndpoints(updatedEndpoints)
      setPresaleSettings({
        ...presaleSettings,
        rpcEndpoints: updatedEndpoints
      })

      setNewEndpoint({ url: '', priority: 1, name: '' })
      onOpenChange()
    } catch (error) {
      console.error('Failed to add endpoint:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditEndpoint = (index: number) => {
    setEditingIndex(index)
    setNewEndpoint(endpoints[index])
    onOpenChange()
  }

  const handleUpdateEndpoint = async () => {
    if (editingIndex !== null && newEndpoint.url && newEndpoint.name) {
      setIsLoading(true)
      try {
        const updatedEndpoints = [...endpoints]
        updatedEndpoints[editingIndex] = newEndpoint
        
        // Save to server
        await coinApi.updateRpcEndpoints(updatedEndpoints)
        
        setEndpoints(updatedEndpoints)
        setPresaleSettings({
          ...presaleSettings,
          rpcEndpoints: updatedEndpoints
        })

        setEditingIndex(null)
        setNewEndpoint({ url: '', priority: 1, name: '' })
        onOpenChange()
      } catch (error) {
        console.error('Failed to update endpoint:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteEndpoint = async (index: number) => {
    setIsLoading(true)
    try {
      const updatedEndpoints = endpoints.filter((_, i) => i !== index)
      
      // Save to server
      await coinApi.updateRpcEndpoints(updatedEndpoints)
      
      setEndpoints(updatedEndpoints)
      setPresaleSettings({
        ...presaleSettings,
        rpcEndpoints: updatedEndpoints
      })
    } catch (error) {
      console.error('Failed to delete endpoint:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setNewEndpoint({ url: '', priority: 1, name: '' })
    onOpenChange()
  }

  const handleSetPrimaryRpc = async () => {
    if (!primaryRpc.trim()) return
    
    setIsLoading(true)
    try {
      // Save to server
      await coinApi.updatePresaleSettings({
        ...presaleSettings,
        rpc: primaryRpc.trim()
      })
      
      setPresaleSettings({
        ...presaleSettings,
        rpc: primaryRpc.trim()
      })
    } catch (error) {
      console.error('Failed to set primary RPC:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return 'success'
    if (priority <= 3) return 'warning'
    return 'default'
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">RPC Endpoints</h2>
              <p className="text-sm text-foreground/60">Manage Solana RPC endpoints with priority</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground/70 mb-2 block">
                  Primary RPC
                </label>
                <Input
                  placeholder="https://api.mainnet-beta.solana.com"
                  value={primaryRpc}
                  onChange={(e) => setPrimaryRpc(e.target.value)}
                  className="text-foreground"
                  classNames={{
                    input: "text-foreground",
                    inputWrapper: "bg-background"
                  }}
                />
              </div>
              <Button 
                color="primary" 
                onPress={handleSetPrimaryRpc}
                isDisabled={!primaryRpc.trim() || isLoading}
                isLoading={isLoading}
              >
                Set Primary
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-foreground/70">
                Current: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs text-foreground">{presaleSettings.rpc || 'Not set'}</code>
              </p>
              <Button color="primary" onPress={onOpen} isDisabled={isLoading}>
                Add Endpoint
              </Button>
            </div>
          </div>

          {endpoints.length > 0 ? (
            <Table aria-label="RPC Endpoints">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>URL</TableColumn>
                <TableColumn>PRIORITY</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {endpoints.map((endpoint, index) => (
                  <TableRow key={index}>
                    <TableCell>{endpoint.name}</TableCell>
                    <TableCell>
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs text-foreground">
                        {endpoint.url.length > 50 ? `${endpoint.url.substring(0, 50)}...` : endpoint.url}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Chip color={getPriorityColor(endpoint.priority)} size="sm">
                        {endpoint.priority}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => handleEditEndpoint(index)}
                          isDisabled={isLoading}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => handleDeleteEndpoint(index)}
                          isDisabled={isLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-foreground/60">
              <p>No additional RPC endpoints configured</p>
              <p className="text-sm">Add endpoints to improve reliability and performance</p>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal classNames={{
        base: "dark",
        header: "dark",
        body: "dark",
        footer: "dark",
        backdrop: "dark",
        closeButton: "dark",
        wrapper: "dark", 
      }} isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editingIndex !== null ? 'Edit RPC Endpoint' : 'Add RPC Endpoint'}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Endpoint Name"
                    placeholder="e.g., Helius Mainnet"
                    value={newEndpoint.name}
                    onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
                    description="A friendly name for this endpoint"
                    classNames={{
                      input: "text-foreground",
                      inputWrapper: "bg-background"
                    }}
                  />
                  
                  <Input
                    label="RPC URL"
                    placeholder="https://api.mainnet-beta.solana.com"
                    value={newEndpoint.url}
                    onChange={(e) => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
                    description="The Solana RPC endpoint URL"
                    classNames={{
                      input: "text-foreground",
                      inputWrapper: "bg-background"
                    }}
                  />
                  
                  <Select
                    label="Priority"
                    classNames={{
                      base: 'dark text-foreground',
                      popoverContent: 'dark',
                      trigger: 'dark',
                      label: 'dark',
                      listbox: 'dark',
                      value: 'dark text-foreground',
                      listboxWrapper: 'dark text-white',
                      clearButton: 'dark text-foreground',
                      helperWrapper: 'dark text-foreground',
                      endWrapper: 'dark text-foreground',
                      endContent: 'dark text-foreground',
                      spinner: 'dark text-foreground',
                    }}
                    placeholder="Select priority"
                    selectedKeys={[newEndpoint.priority.toString()]}
                    onSelectionChange={(keys) => {
                      const priority = parseInt(Array.from(keys)[0] as string)
                      setNewEndpoint({ ...newEndpoint, priority })
                    }}
                    description="Lower numbers have higher priority"
                  >
                    <SelectItem classNames={{ base: 'dark text-foreground'}} key="1" value="1">1 - Highest Priority</SelectItem>
                    <SelectItem classNames={{ base: 'dark text-foreground'}} key="2" value="2">2 - High Priority</SelectItem>
                    <SelectItem classNames={{ base: 'dark text-foreground'}} key="3" value="3">3 - Medium Priority</SelectItem>
                    <SelectItem classNames={{ base: 'dark text-foreground'}} key="4" value="4">4 - Low Priority</SelectItem>
                    <SelectItem classNames={{ base: 'dark text-foreground'}} key="5" value="5">5 - Lowest Priority</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={handleCancel}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={editingIndex !== null ? handleUpdateEndpoint : handleAddEndpoint}
                  isDisabled={!newEndpoint.url || !newEndpoint.name || isLoading}
                  isLoading={isLoading}
                >
                  {editingIndex !== null ? 'Update' : 'Add'} Endpoint
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
