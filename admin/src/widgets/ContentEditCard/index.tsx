import { MarkDownEditor } from '@/widgets/MarkDownEditor'
import { Button, Card, CardBody, CardHeader, Textarea } from '@heroui/react'
import ImagePicker from '@/widgets/ImagePicker'
import { usePageEditorStore } from '@/app/store/pageEditor'
import type { MediaFile } from '../../pages/MediaLibrary/model'
import styles from './styles/ContentEditCard.module.scss'
import { ComplexArrayEditor } from './ComplexArrayEditor'

interface ContentEditCardProps {
  item: {
    type: string
    name: string
    description?: string
    multiple?: boolean
    maxSelection?: number
    value?: any
    images?: any[]
    withImage?: boolean
    validation?: Record<string, any>
    textFieldsCount?: number
  }
  content: Record<string, string>
  images: Record<string, MediaFile[]>
  markdown: Record<string, string>
  index: number
}

const ContentEditCard = ({
  item,
  content,
  images,
  markdown,
  index
}: ContentEditCardProps) => {
  const { setContentField, setImageField, setMarkdownField } = usePageEditorStore()

  if (item.type === 'content' && item.multiple) {
    return (
      <div className={styles.contentEditCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <div className={`${styles.iconWrapper} ${styles.primary}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className={styles.textContent}>
                <h3>{item.name}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            </div>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              className={styles.actionButton}
              startContent={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2m-6-4l2 2 4-4" />
                </svg>
              }
              onPress={() => {
                const fieldValue = content[item.name] || ''
                navigator.clipboard.writeText(fieldValue)
              }}
            >
              Copy
            </Button>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formSection}>
            <label>Text Content</label>
            <div className={styles.inputWrapper}>
              <textarea
                placeholder="Enter content here..."
                rows={3}
                value={content[item.name] || ''}
                onChange={(e) => {
                  setContentField(item.name, e.target.value)
                }}
              />
            </div>
          </div>
          <div className={styles.formSection}>
            <label>Images</label>
            <div className={styles.imagePickerWrapper}>
              <ImagePicker
                onSelect={(selectedImages) => {
                  // Для полей с withImage сохраняем изображения в отдельное поле
                  const imageFieldName = `${item.name}_images`
                  setImageField(imageFieldName, selectedImages)
                }}
                selectedImages={images[`${item.name}_images`] || []}
                multiple={item.multiple}
                maxSelection={item.maxSelection || 1}
                placeholder={`Select up to ${item.maxSelection} images...`}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (item.type === 'content' && item.withImage && !item.multiple) {
    return (
      <div className={styles.contentEditCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <div className={`${styles.iconWrapper} ${styles.info}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className={styles.textContent}>
                <h3>{item.name}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formSection}>
            <label>Content</label>
            <div className={styles.inputWrapper}>
              <textarea
                placeholder="Enter content here..."
                rows={4}
                value={content[item.name] || ''}
                onChange={(e) => {
                  setContentField(item.name, e.target.value)
                }}
              />
            </div>
          </div>
          <div className={styles.formSection}>
            <label>Image</label>
            <div className={styles.imagePickerWrapper}>
              <ImagePicker
                onSelect={(selectedImages) => {
                  // Для полей с withImage сохраняем изображения в отдельное поле
                  // Это позволяет разделить текст и изображения в одном поле
                  const imageFieldName = `${item.name}_images`
                  setImageField(imageFieldName, selectedImages)
                }}
                selectedImages={images[`${item.name}_images`] || []}
                multiple={false}
                maxSelection={1}
                placeholder="Select an image..."
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (item.type === 'content' && !item.withImage) {
    return (
      <div className={styles.contentEditCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <div className={`${styles.iconWrapper} ${styles.success}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className={styles.textContent}>
                <h3>{item.name}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formSection}>
            <label>Content</label>
            <div className={styles.inputWrapper}>
              <textarea
                placeholder="Enter content here..."
                rows={4}
                value={content[item.name] || ''}
                onChange={(e) => {
                  setContentField(item.name, e.target.value)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (item.type === 'images') {
    return (
      <div className={styles.contentEditCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <div className={`${styles.iconWrapper} ${styles.warning}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className={styles.textContent}>
                <h3>{item.name}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formSection}>
            <label>Images</label>
            <div className={styles.imagePickerWrapper}>
              <ImagePicker
                onSelect={(selectedImages) => {
                  setImageField(item.name, selectedImages)
                }}
                selectedImages={images[item.name] || []}
                multiple={item.multiple}
                maxSelection={item.maxSelection || 1}
                placeholder={`Select up to ${item.maxSelection} images...`}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (item.type === 'markdown') {
    return (
      <div className={styles.contentEditCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <div className={`${styles.iconWrapper} ${styles.secondary}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className={styles.textContent}>
                <h3>{item.name}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formSection}>
            <label>Rich Content</label>
            <div className={styles.markdownWrapper}>
              <MarkDownEditor
                value={markdown?.[item.name as keyof typeof markdown] || ''}
                onChange={(value) => {
                  setMarkdownField(item.name, value)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (item.type === 'complex') {
    return (
      <div className={styles.contentEditCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <div className={`${styles.iconWrapper} ${styles.primary}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className={styles.textContent}>
                <h3>{item.name}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.cardBody}>
          <ComplexArrayEditor 
            fieldName={item.name}
            maxItems={item.maxSelection || 10}
            content={content}
            images={images}
            fieldConfig={{
              enableFirstInput: item.validation?.enableFirstInput !== false,
              enableSecondInput: item.validation?.enableSecondInput !== false,
              enableImage: item.validation?.enableImage !== false,
              firstInputLabel: item.validation?.firstInputLabel || 'First Input',
              secondInputLabel: item.validation?.secondInputLabel || 'Second Input',
              imageLabel: item.validation?.imageLabel || 'Image',
              textFieldsCount: item.textFieldsCount || 2,
              // Передаем настройки для дополнительных полей (3-5)
              ...(item.textFieldsCount && item.textFieldsCount > 2 ? 
                Object.fromEntries(
                  Array.from({ length: item.textFieldsCount - 2 }, (_, i) => {
                    const fieldIndex = i + 3;
                    return [
                      `enableTextField${fieldIndex}`,
                      item.validation?.[`enableTextField${fieldIndex}`] !== false
                    ];
                  })
                ) : {}
              ),
              // Передаем лейблы для дополнительных полей
              ...(item.textFieldsCount && item.textFieldsCount > 2 ? 
                Object.fromEntries(
                  Array.from({ length: item.textFieldsCount - 2 }, (_, i) => {
                    const fieldIndex = i + 3;
                    return [
                      `textField${fieldIndex}Label`,
                      item.validation?.[`textField${fieldIndex}Label`] || `Field ${fieldIndex}`
                    ];
                  })
                ) : {}
              ),
            }}
            onUpdate={(data: any) => {
              setContentField(item.name, JSON.stringify(data))
            }}
          />
        </div>
      </div>
    )
  }

  return null
}

export { ContentEditCard } 