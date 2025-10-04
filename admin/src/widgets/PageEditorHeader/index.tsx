import { Progress, Button, Input } from '@heroui/react'
import { useState } from 'react'
import { usePageEditorStore } from '@/app/store/pageEditor'
import { usePageEditorActions, useUrlManagement } from './model'
import styles from './styles/PageEditorHeader.module.scss'

interface PageEditorHeaderProps {
  content: Record<string, any>
  testDataLength: number
  images: Record<string, any>
  markdown: Record<string, string>
  sectionName: string
  onSave?: () => Promise<void>
  onReset?: () => void
  onUrlChange?: (newUrl: string) => void
  onSectionNameChange?: (newName: string) => void
}

const PageEditorHeader = ({
  content,
  testDataLength: _testDataLength,
  images,
  markdown,
  sectionName,
  onSave,
  onReset,
  onUrlChange,
  onSectionNameChange,
}: PageEditorHeaderProps) => {
  const { exportData, getCompletionPercentage, getCompletedFields, getTotalFields } =
    usePageEditorStore()

  // State for editing section name
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(sectionName)

  // Get completion data from store
  const completedFields = getCompletedFields()
  const totalFields = getTotalFields()
  const completionPercentage = getCompletionPercentage()

  // Early return if no section data is available
  if (!sectionName) {
    return null
  }

  // Use custom hooks
  const { isSaving, handleSaveChanges, handleResetToDefault } = usePageEditorActions(onSave, onReset)
  const { url, setUrl, isChangingUrl, handleChangeUrl, urlError, isUrlModified, handleCancelUrlChange } = useUrlManagement(onUrlChange)

  const handleNameEdit = () => {
    setIsEditingName(true)
    setEditedName(sectionName)
  }

  const handleNameSave = () => {
    if (editedName.trim() && editedName !== sectionName && onSectionNameChange) {
      onSectionNameChange(editedName.trim())
    }
    setIsEditingName(false)
  }

  const handleNameCancel = () => {
    setEditedName(sectionName)
    setIsEditingName(false)
  }

  return (
    <div className={styles.pageEditorHeader}>
      <div className={styles.headerContent}>
        <div className={styles.infoGrid}>
          <div className={styles.contentEditorCard}>
            <h2 className={styles.cardTitle}>
              <div className={`${styles.iconWrapper} ${styles.primary}`}>
                <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                  />
                </svg>
              </div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    size="sm"
                    className="max-w-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSave()
                      if (e.key === 'Escape') handleNameCancel()
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    color="success"
                    variant="flat"
                    isIconOnly
                    onPress={handleNameSave}
                    aria-label="Save section name"
                  >
                    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24' className='w-4 h-4'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    isIconOnly
                    onPress={handleNameCancel}
                    aria-label="Cancel editing section name"
                  >
                    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24' className='w-4 h-4'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{sectionName}</span>
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={handleNameEdit}
                    className={styles.editButton}
                    aria-label="Edit section name"
                  >
                    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24' className='w-4 h-4'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                    </svg>
                  </Button>
                </div>
              )}
            </h2>

            <div className={styles.contentEditorContent}>
              <div className={styles.quickActions}>
                <h3>Quick Actions</h3>
                <div className={styles.actionButtons}>
                  <Button
                    variant='flat'
                    color='success'
                    size='sm'
                    className={styles.actionButton}
                    onPress={handleSaveChanges}
                    isLoading={isSaving}
                    startContent={
                      <svg
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                        className='w-4 h-4'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    }
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant='flat'
                    color='secondary'
                    size='sm'
                    className={styles.actionButton}
                    onPress={handleResetToDefault}
                    startContent={
                      <svg
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                        className='w-4 h-4'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                        />
                      </svg>
                    }
                  >
                    Reset to Default
                  </Button>
                  <Button
                    variant='flat'
                    color='primary'
                    size='sm'
                    className={styles.actionButton}
                    onPress={exportData}
                    startContent={
                      <svg
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                        className='w-4 h-4'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                      </svg>
                    }
                  >
                    Export Data
                  </Button>
                </div>

                <div className={styles.apiUrlSection}>
                  <label>
                    API URL for Data Fetching:
                    {isUrlModified && (
                      <span className={styles.urlModifiedIndicator}>
                        (Modified - will be saved)
                      </span>
                    )}
                  </label>
                  <div className={styles.urlInputWrapper}>
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !urlError && url.trim()) {
                          handleChangeUrl()
                        }
                      }}
                      placeholder='Enter API endpoint URL'
                      className={styles.urlInput}
                      size='sm'
                      isInvalid={!!urlError}
                      errorMessage={urlError}
                    />
                    <Button
                      size='sm'
                      color='primary'
                      variant='flat'
                      onPress={handleChangeUrl}
                      isLoading={isChangingUrl}
                      isDisabled={!!urlError || !url.trim()}
                    >
                      {isChangingUrl ? 'Changing...' : 'Change'}
                    </Button>
                    {isUrlModified && (
                      <Button
                        size='sm'
                        color='default'
                        variant='flat'
                        onPress={handleCancelUrlChange}
                        isDisabled={isChangingUrl}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.contentStats}>
                <h3>Content Statistics</h3>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{totalFields}</div>
                    <div className={styles.statLabel}>Total Fields</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{completedFields}</div>
                    <div className={styles.statLabel}>Completed</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{Object.keys(images).length}</div>
                    <div className={styles.statLabel}>With Images</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>
                      {Object.keys(markdown).length > 0 ? 'Yes' : 'No'}
                    </div>
                    <div className={styles.statLabel}>Markdown</div>
                  </div>
                </div>

                <div className={styles.analyticsSection}>
                  <h4>Analytics Overview</h4>
                  <div className={styles.analyticsGrid}>
                    <div className={styles.analyticsItem}>
                      <span className={styles.analyticsLabel}>Completion Rate</span>
                      <span className={styles.analyticsValue}>{completionPercentage}%</span>
                    </div>
                    <div className={styles.analyticsItem}>
                      <span className={styles.analyticsLabel}>Content Types</span>
                      <span className={styles.analyticsValue}>
                        {
                          Object.keys(content).filter((key) => typeof content[key] === 'string')
                            .length
                        }{' '}
                        text,
                        {Object.keys(images).length} images,
                        {markdown ? 1 : 0} markdown
                      </span>
                    </div>
                    <div className={styles.analyticsItem}>
                      <span className={styles.analyticsLabel}>Last Updated</span>
                      <span className={styles.analyticsValue}>
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sidebarCards}>
            <div className={styles.progressCard}>
              <h3 className={styles.cardSubtitle}>
                <div className={`${styles.iconWrapper} ${styles.success}`}>
                  <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                Progress
              </h3>
              <div className={styles.progressContent}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>Completion</span>
                  <span className={styles.progressValue}>{completionPercentage}%</span>
                </div>
                <Progress
                  value={completionPercentage}
                  className={styles.progressBar}
                  color='success'
                  size='lg'
                  showValueLabel={false}
                  classNames={{
                    track: styles.progressTrack,
                    indicator: styles.progressIndicator,
                  }}
                />
                <div className={styles.progressFooter}>
                  <span className={styles.progressText}>
                    {completedFields} of {totalFields} fields completed
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.tipsCard}>
              <h3 className={styles.cardSubtitle}>
                <div className={`${styles.iconWrapper} ${styles.primary}`}>
                  <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                Quick Tips
              </h3>
              <div className={styles.tipsList}>
                <div className={`${styles.tipItem} ${styles.primaryTip}`}>
                  <span className={styles.tipDot}></span>
                  <span className={styles.tipText}>Use descriptions as guidelines</span>
                </div>
                <div className={`${styles.tipItem} ${styles.successTip}`}>
                  <span className={styles.tipDot}></span>
                  <span className={styles.tipText}>Images should match recommended sizes</span>
                </div>
                <div className={`${styles.tipItem} ${styles.warningTip}`}>
                  <span className={styles.tipDot}></span>
                  <span className={styles.tipText}>Markdown supports rich formatting</span>
                </div>
                <div className={`${styles.tipItem} ${styles.infoTip}`}>
                  <span className={styles.tipDot}></span>
                  <span className={styles.tipText}>Auto-save your work regularly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { PageEditorHeader }
