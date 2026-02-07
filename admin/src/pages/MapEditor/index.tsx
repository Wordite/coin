import { useState, useRef, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Chip,
  Textarea,
  Divider,
} from '@heroui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mapApi, type MapZone, type MapMarker, type MapMarkerCard } from '@/services/mapApi'
import { Notify } from '@/services/notify'
import { TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline'
import { ImagePicker } from '@/widgets/ImagePicker'
import { getImageUrl } from '@/pages/MediaLibrary/model'
import type { MediaFile } from '@/pages/MediaLibrary/model'
import mapImage from '@/assets/map.png'

type EditorMode = 'zones' | 'markers'

const MapEditor = () => {
  const queryClient = useQueryClient()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [editorMode, setEditorMode] = useState<EditorMode>('zones')
  const [selectedZone, setSelectedZone] = useState<MapZone | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [selectedCard, setSelectedCard] = useState<MapMarkerCard | null>(null)

  // Zone modal
  const { isOpen: isZoneOpen, onOpen: onZoneOpen, onClose: onZoneClose } = useDisclosure()
  const [zoneForm, setZoneForm] = useState({
    name: '',
    x: 50,
    y: 50,
    fontSize: 1.5,
    color: '#ffffff',
  })

  // Marker modal
  const { isOpen: isMarkerOpen, onOpen: onMarkerOpen, onClose: onMarkerClose } = useDisclosure()
  const [markerForm, setMarkerForm] = useState({
    x: 50,
    y: 50,
    color: '#ff3333',
    size: 0.12,
    title: '',
  })

  // Card modal
  const { isOpen: isCardOpen, onOpen: onCardOpen, onClose: onCardClose } = useDisclosure()
  const [cardForm, setCardForm] = useState({
    photo: '',
    title: '',
    description: '',
    apy: 60,
    vip: 'Gold',
    price: 1234,
  })
  const [cardMarkerId, setCardMarkerId] = useState<string | null>(null)

  // Title state
  const [title, setTitle] = useState('')

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['mapSettings'],
    queryFn: () => mapApi.getSettings(),
  })

  useEffect(() => {
    if (settings) {
      setTitle(settings.title)
    }
  }, [settings])

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: (data: { title: string }) => mapApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapSettings'] })
      Notify.success('Title updated')
    },
    onError: () => Notify.error('Failed to update title'),
  })

  const createZoneMutation = useMutation({
    mutationFn: mapApi.createZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapSettings'] })
      Notify.success('Zone created')
      onZoneClose()
      resetZoneForm()
    },
    onError: () => Notify.error('Failed to create zone'),
  })

  const updateZoneMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MapZone> }) =>
      mapApi.updateZone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapSettings'] })
      Notify.success('Zone updated')
      onZoneClose()
      setSelectedZone(null)
      resetZoneForm()
    },
    onError: () => Notify.error('Failed to update zone'),
  })

  const deleteZoneMutation = useMutation({
    mutationFn: mapApi.deleteZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapSettings'] })
      Notify.success('Zone deleted')
    },
    onError: () => Notify.error('Failed to delete zone'),
  })

  const createMarkerMutation = useMutation({
    mutationFn: mapApi.createMarker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapSettings'] })
      Notify.success('Marker created')
      onMarkerClose()
      resetMarkerForm()
    },
    onError: () => Notify.error('Failed to create marker'),
  })

  const updateMarkerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MapMarker> }) =>
      mapApi.updateMarker(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapSettings'] })
      Notify.success('Marker updated')
      onMarkerClose()
      setSelectedMarker(null)
      resetMarkerForm()
    },
    onError: () => Notify.error('Failed to update marker'),
  })

  const deleteMarkerMutation = useMutation({
    mutationFn: mapApi.deleteMarker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapSettings'] })
      Notify.success('Marker deleted')
    },
    onError: () => Notify.error('Failed to delete marker'),
  })

  // Card mutations
  const createCardMutation = useMutation({
    mutationFn: ({ markerId, data }: { markerId: string; data: Partial<MapMarkerCard> }) =>
      mapApi.createMarkerCard(markerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapSettings'] })
      Notify.success('Card created')
      onCardClose()
      resetCardForm()
    },
    onError: () => Notify.error('Failed to create card'),
  })

  const updateCardMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MapMarkerCard> }) =>
      mapApi.updateMarkerCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapSettings'] })
      Notify.success('Card updated')
      onCardClose()
      setSelectedCard(null)
      resetCardForm()
    },
    onError: () => Notify.error('Failed to update card'),
  })

  const deleteCardMutation = useMutation({
    mutationFn: mapApi.deleteMarkerCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapSettings'] })
      Notify.success('Card deleted')
    },
    onError: () => Notify.error('Failed to delete card'),
  })

  const resetZoneForm = () => {
    setZoneForm({ name: '', x: 50, y: 50, fontSize: 1.5, color: '#ffffff' })
  }

  const resetMarkerForm = () => {
    setMarkerForm({
      x: 50,
      y: 50,
      color: '#ff3333',
      size: 0.12,
      title: '',
    })
  }

  const resetCardForm = () => {
    setCardForm({
      photo: '',
      title: '',
      description: '',
      apy: 60,
      vip: 'Gold',
      price: 1234,
    })
    setCardMarkerId(null)
  }

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return

    const rect = mapContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    if (editorMode === 'zones') {
      setZoneForm(prev => ({ ...prev, x, y }))
      onZoneOpen()
    } else {
      setMarkerForm(prev => ({ ...prev, x, y }))
      onMarkerOpen()
    }
  }

  const handleEditZone = (zone: MapZone) => {
    setSelectedZone(zone)
    setZoneForm({
      name: zone.name,
      x: zone.x,
      y: zone.y,
      fontSize: zone.fontSize,
      color: zone.color,
    })
    onZoneOpen()
  }

  const handleEditMarker = (marker: MapMarker) => {
    setSelectedMarker(marker)
    setMarkerForm({
      x: marker.x,
      y: marker.y,
      color: marker.color,
      size: marker.size,
      title: marker.title || '',
    })
    onMarkerOpen()
  }

  const handleAddCard = (markerId: string) => {
    setSelectedCard(null)
    setCardForm({
      photo: '',
      title: '',
      description: '',
      apy: 60,
      vip: 'Gold',
      price: 1234,
    })
    setCardMarkerId(markerId)
    onCardOpen()
  }

  const handleEditCard = (card: MapMarkerCard, markerId: string) => {
    setSelectedCard(card)
    setCardMarkerId(markerId)
    setCardForm({
      photo: card.photo || '',
      title: card.title || '',
      description: card.description || '',
      apy: card.apy,
      vip: card.vip,
      price: card.price,
    })
    onCardOpen()
  }

  const handleZoneSubmit = () => {
    if (selectedZone) {
      updateZoneMutation.mutate({ id: selectedZone.id, data: zoneForm })
    } else {
      createZoneMutation.mutate(zoneForm)
    }
  }

  const handleMarkerSubmit = () => {
    if (selectedMarker) {
      updateMarkerMutation.mutate({ id: selectedMarker.id, data: markerForm })
    } else {
      createMarkerMutation.mutate(markerForm)
    }
  }

  const handleCardSubmit = () => {
    if (selectedCard) {
      updateCardMutation.mutate({ id: selectedCard.id, data: cardForm })
    } else if (cardMarkerId) {
      createCardMutation.mutate({ markerId: cardMarkerId, data: cardForm })
    }
  }

  const handleZoneModalClose = () => {
    onZoneClose()
    setSelectedZone(null)
    resetZoneForm()
  }

  const handleMarkerModalClose = () => {
    onMarkerClose()
    setSelectedMarker(null)
    resetMarkerForm()
  }

  const handleCardModalClose = () => {
    onCardClose()
    setSelectedCard(null)
    resetCardForm()
  }

  const handleImageSelect = (images: MediaFile[]) => {
    if (images.length > 0) {
      setCardForm(prev => ({ ...prev, photo: images[0].url }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Map Editor</h1>
              <p className="text-foreground/60">Configure Tycoin Land map zones and markers</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Title Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Map Title</h2>
        </CardHeader>
        <CardBody>
          <div className="flex gap-4">
            <Input
              label="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="max-w-md"
            />
            <Button
              color="primary"
              onPress={() => updateSettingsMutation.mutate({ title })}
              isLoading={updateSettingsMutation.isPending}
            >
              Save Title
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Editor Mode Tabs */}
      <Card>
        <CardBody>
          <Tabs
            selectedKey={editorMode}
            onSelectionChange={key => setEditorMode(key as EditorMode)}
          >
            <Tab key="zones" title="Zones (Text Labels)" />
            <Tab key="markers" title="Markers (Interactive Points)" />
          </Tabs>
        </CardBody>
      </Card>

      {/* Map Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Canvas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg font-semibold">
                {editorMode === 'zones' ? 'Click to add zone label' : 'Click to add marker'}
              </h2>
              <Button
                color="primary"
                size="sm"
                startContent={<PlusIcon className="w-4 h-4" />}
                onPress={editorMode === 'zones' ? onZoneOpen : onMarkerOpen}
              >
                Add {editorMode === 'zones' ? 'Zone' : 'Marker'}
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div
              ref={mapContainerRef}
              className="relative w-full cursor-crosshair border border-divider rounded-lg overflow-hidden"
              onClick={handleMapClick}
            >
              <img src={mapImage} alt="Map" className="w-full h-auto" />

              {/* Render zones as text labels */}
              {settings?.zones.map(zone => (
                <div
                  key={zone.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none font-bold drop-shadow-lg"
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    fontSize: `${zone.fontSize}rem`,
                    color: zone.color,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  }}
                >
                  {zone.name}
                </div>
              ))}

              {/* Render markers as dots (using percentage coordinates) */}
              {settings?.markers.map(marker => (
                <div
                  key={marker.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg cursor-pointer"
                  style={{
                    left: `${marker.x}%`,
                    top: `${marker.y}%`,
                    width: '16px',
                    height: '16px',
                    backgroundColor: marker.color,
                    boxShadow: `0 0 10px ${marker.color}`,
                  }}
                  onClick={e => {
                    e.stopPropagation()
                    handleEditMarker(marker)
                  }}
                />
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Items List */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">
              {editorMode === 'zones' ? 'Zones' : 'Markers'} ({editorMode === 'zones' ? settings?.zones.length : settings?.markers.length})
            </h2>
          </CardHeader>
          <CardBody className="space-y-2 max-h-[600px] overflow-y-auto">
            {editorMode === 'zones' ? (
              settings?.zones.length === 0 ? (
                <p className="text-foreground/60 text-center py-4">No zones yet. Click on the map to add one.</p>
              ) : (
                settings?.zones.map(zone => (
                  <div
                    key={zone.id}
                    className="flex items-center justify-between p-3 bg-default-100 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: zone.color }}
                      />
                      <span className="font-medium">{zone.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEditZone(zone)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => deleteZoneMutation.mutate(zone.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )
            ) : settings?.markers.length === 0 ? (
              <p className="text-foreground/60 text-center py-4">No markers yet. Click on the map to add one.</p>
            ) : (
              settings?.markers.map(marker => (
                <div
                  key={marker.id}
                  className="p-3 bg-default-100 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: marker.color }}
                      />
                      <span className="font-medium">{marker.title || 'Unnamed Marker'}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEditMarker(marker)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => deleteMarkerMutation.mutate(marker.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Cards list */}
                  <div className="pl-6 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60">Cards ({marker.cards?.length || 0})</span>
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<PlusIcon className="w-3 h-3" />}
                        onPress={() => handleAddCard(marker.id)}
                      >
                        Add Card
                      </Button>
                    </div>
                    {marker.cards?.map(card => (
                      <div
                        key={card.id}
                        className="flex items-center justify-between p-2 bg-default-200 rounded"
                      >
                        <div className="flex items-center gap-2">
                          {card.photo && (
                            <img
                              src={getImageUrl(card.photo)}
                              alt=""
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <div>
                            <span className="text-sm font-medium">{card.title || 'Untitled'}</span>
                            <div className="flex gap-1 mt-0.5">
                              <Chip size="sm" color="success" variant="flat">{card.apy}% APY</Chip>
                              <Chip size="sm" color="secondary" variant="flat">{card.vip}</Chip>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleEditCard(card, marker.id)}
                          >
                            <PencilIcon className="w-3 h-3" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => deleteCardMutation.mutate(card.id)}
                          >
                            <TrashIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      {/* Zone Modal */}
      <Modal isOpen={isZoneOpen} onClose={handleZoneModalClose} size="lg" className="dark text-foreground bg-background">
        <ModalContent>
          <ModalHeader>{selectedZone ? 'Edit Zone' : 'Add Zone'}</ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Zone Name"
              placeholder="e.g., Great Island"
              value={zoneForm.name}
              onChange={e => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="X Position (%)"
                value={zoneForm.x.toString()}
                onChange={e => setZoneForm(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
              />
              <Input
                type="number"
                label="Y Position (%)"
                value={zoneForm.y.toString()}
                onChange={e => setZoneForm(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Font Size (rem)"
                value={zoneForm.fontSize.toString()}
                onChange={e => setZoneForm(prev => ({ ...prev, fontSize: parseFloat(e.target.value) || 1.5 }))}
              />
              <Input
                type="color"
                label="Text Color"
                value={zoneForm.color}
                onChange={e => setZoneForm(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleZoneModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleZoneSubmit}
              isLoading={createZoneMutation.isPending || updateZoneMutation.isPending}
            >
              {selectedZone ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Marker Modal */}
      <Modal isOpen={isMarkerOpen} onClose={handleMarkerModalClose} size="lg" className="dark text-foreground bg-background">
        <ModalContent>
          <ModalHeader>{selectedMarker ? 'Edit Marker' : 'Add Marker'}</ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Marker Title"
              placeholder="e.g., Luxury Villa"
              value={markerForm.title}
              onChange={e => setMarkerForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="X Position (%)"
                value={markerForm.x.toString()}
                onChange={e => setMarkerForm(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
              />
              <Input
                type="number"
                label="Y Position (%)"
                value={markerForm.y.toString()}
                onChange={e => setMarkerForm(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="color"
                label="Marker Color"
                value={markerForm.color}
                onChange={e => setMarkerForm(prev => ({ ...prev, color: e.target.value }))}
              />
              <Input
                type="number"
                label="Marker Size"
                value={markerForm.size.toString()}
                onChange={e => setMarkerForm(prev => ({ ...prev, size: parseFloat(e.target.value) || 0.12 }))}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleMarkerModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleMarkerSubmit}
              isLoading={createMarkerMutation.isPending || updateMarkerMutation.isPending}
            >
              {selectedMarker ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Card Modal */}
      <Modal isOpen={isCardOpen} onClose={handleCardModalClose} size="2xl" className="dark text-foreground bg-background">
        <ModalContent>
          <ModalHeader>{selectedCard ? 'Edit Card' : 'Add Card'}</ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Photo</label>
              <ImagePicker
                onSelect={handleImageSelect}
                multiple={false}
                selectedImages={cardForm.photo ? [{ id: 'current', url: cardForm.photo, originalName: 'Current Photo' } as MediaFile] : []}
                placeholder="Select photo from media library"
              />
              {cardForm.photo && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={getImageUrl(cardForm.photo)}
                    alt="Preview"
                    className="w-16 h-16 rounded object-cover"
                  />
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    onPress={() => setCardForm(prev => ({ ...prev, photo: '' }))}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <Input
              label="Title"
              placeholder="Card title"
              value={cardForm.title}
              onChange={e => setCardForm(prev => ({ ...prev, title: e.target.value }))}
            />

            <Textarea
              label="Description"
              placeholder="Description of this land parcel"
              value={cardForm.description}
              onChange={e => setCardForm(prev => ({ ...prev, description: e.target.value }))}
              minRows={3}
            />

            <Divider />

            <div className="grid grid-cols-3 gap-4">
              <Input
                type="number"
                label="APY (%)"
                value={cardForm.apy.toString()}
                onChange={e => setCardForm(prev => ({ ...prev, apy: parseFloat(e.target.value) || 60 }))}
              />
              <Input
                label="VIP Level"
                placeholder="Gold, Silver, etc."
                value={cardForm.vip}
                onChange={e => setCardForm(prev => ({ ...prev, vip: e.target.value }))}
              />
              <Input
                type="number"
                label="Price ($)"
                value={cardForm.price.toString()}
                onChange={e => setCardForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 1234 }))}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleCardModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleCardSubmit}
              isLoading={createCardMutation.isPending || updateCardMutation.isPending}
            >
              {selectedCard ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default MapEditor
