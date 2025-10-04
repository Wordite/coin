import MDEditor, { commands } from '@uiw/react-md-editor'
import { Card, CardBody } from '@heroui/react'
import styles from './styles/MarkDownEditor.module.scss'
import ImagePicker from '@/widgets/ImagePicker'
import { useCallback } from 'react'
import type { MediaFile } from '@/pages/MediaLibrary/model'
import { getImageUrl } from '@/pages/MediaLibrary/model'

const MarkDownEditor = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
  // local state is not currently needed to control ImagePicker
  
  const handleChange = (val?: string) => {
    if (val !== undefined) {
      onChange(val)
    }
  }

  const handleInsertImage = useCallback((files: MediaFile[]) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const absoluteUrl = getImageUrl(file.url)
    const imageMarkdown = `\n![](${absoluteUrl})\n`
    onChange((value || '') + imageMarkdown)
  }, [onChange, value])

  // Toolbar without default image button
  const toolbarCommands = [
    commands.bold,
    commands.italic,
    commands.strikethrough,
    commands.hr,
    commands.title,
    commands.divider,
    commands.link,
    commands.quote,
    commands.code,
    commands.codeBlock,
    commands.table,
    commands.divider,
    commands.unorderedListCommand,
    commands.orderedListCommand,
    commands.checkedListCommand,
    commands.divider,
    commands.help,
    commands.divider,
    commands.fullscreen,
  ]
  
  return (
    <Card className='w-full h-[30rem] bg-background border-1 border-divider'>
      <CardBody className='p-0 h-full'>
        
        {/* Divider между заголовком и контентом */}
        <div className={styles.headerDivider} />
        
        {/* Custom action bar for inserting images via media library */}
        <div className='px-3 py-2 border-b border-divider flex items-center gap-3 bg-background/50'>
          <ImagePicker
            onSelect={handleInsertImage}
            multiple={false}
            selectedImages={[]}
            placeholder='Insert image from library'
          />
        </div>

        <div className={styles.markdownEditor}>
          <MDEditor
            value={value || ''}
            onChange={handleChange}
            preview='live'
            data-color-mode='dark'
            style={{
              backgroundColor: 'transparent',
              color: 'hsl(var(--foreground))',
            }}
            textareaProps={{
              style: {
                backgroundColor: 'transparent',
                color: 'hsl(var(--foreground))',
                fontSize: '14px',
                lineHeight: '1.6',
              },
            }}
            previewOptions={{
              style: {
                backgroundColor: 'transparent',
                color: 'hsl(var(--foreground))',
                fontSize: '14px',
                lineHeight: '1.6',
              },
            }}
            height={400}
            visibleDragbar={false}
            hideToolbar={false}
            enableScroll={true}
            commands={toolbarCommands}
          />
        </div>
      </CardBody>
    </Card>
  )
}

export { MarkDownEditor }
