# ImagePicker Component

Компонент для выбора изображений из Media Library с модальным окном.

## Особенности

- ✅ **Выбор одного или нескольких изображений**
- ✅ **Поиск и фильтрация по типу файла**
- ✅ **Сортировка по имени, размеру, дате**
- ✅ **Пагинация для больших коллекций**
- ✅ **Темная тема**
- ✅ **Адаптивный дизайн**
- ✅ **Accessibility поддержка**

## Использование

### Базовое использование (один файл)

```tsx
import { ImagePicker } from '@/widgets/ImagePicker'
import type { MediaFile } from '@/pages/MediaLibrary/model'

const [selectedImage, setSelectedImage] = useState<MediaFile | null>(null)

<ImagePicker
  onSelect={(images) => setSelectedImage(images[0] || null)}
  selectedImages={selectedImage ? [selectedImage] : []}
  placeholder='Выберите изображение...'
/>
```

### Множественный выбор

```tsx
const [selectedImages, setSelectedImages] = useState<MediaFile[]>([])

<ImagePicker
  onSelect={setSelectedImages}
  selectedImages={selectedImages}
  multiple={true}
  maxSelection={5}
  placeholder='Выберите до 5 изображений...'
/>
```

## Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `onSelect` | `(selectedImages: MediaFile[]) => void` | - | **Обязательный.** Callback при выборе изображений |
| `multiple` | `boolean` | `false` | Разрешить выбор нескольких изображений |
| `maxSelection` | `number` | `10` | Максимальное количество выбираемых изображений |
| `selectedImages` | `MediaFile[]` | `[]` | Массив уже выбранных изображений |
| `className` | `string` | `''` | CSS классы для контейнера |
| `placeholder` | `string` | `'Select images...'` | Текст плейсхолдера |

## Типы

```tsx
interface ImagePickerProps {
  onSelect: (selectedImages: MediaFile[]) => void
  multiple?: boolean
  maxSelection?: number
  selectedImages?: MediaFile[]
  className?: string
  placeholder?: string
}
```

## Примеры

### В PageEditor

```tsx
import { ImagePicker } from '@/widgets/ImagePicker'

const PageEditor = () => {
  const [heroImage, setHeroImage] = useState<MediaFile | null>(null)
  const [galleryImages, setGalleryImages] = useState<MediaFile[]>([])

  return (
    <div className='space-y-6'>
      {/* Hero Image */}
      <div>
        <label className='block text-sm font-medium mb-2'>Hero Image</label>
        <ImagePicker
          onSelect={(images) => setHeroImage(images[0] || null)}
          selectedImages={heroImage ? [heroImage] : []}
          placeholder='Выберите главное изображение...'
        />
      </div>

      {/* Gallery Images */}
      <div>
        <label className='block text-sm font-medium mb-2'>Gallery Images</label>
        <ImagePicker
          onSelect={setGalleryImages}
          selectedImages={galleryImages}
          multiple={true}
          maxSelection={10}
          placeholder='Выберите изображения для галереи...'
        />
      </div>
    </div>
  )
}
```

### С кастомными стилями

```tsx
<ImagePicker
  onSelect={handleImageSelect}
  selectedImages={selectedImages}
  multiple={true}
  className='w-full max-w-lg'
  placeholder='Выберите изображения...'
/>
```

## Функциональность

### Поиск и фильтрация
- **Поиск по названию** - мгновенный поиск по имени файла
- **Фильтр по типу** - выбор конкретного расширения файла
- **Дебаунсинг** - поиск не блокирует интерфейс

### Сортировка
- **По имени** - алфавитная сортировка
- **По размеру** - от маленьких к большим файлам
- **По дате** - по дате создания

### Пагинация
- **Настраиваемое количество** элементов на странице
- **Навигация** с кнопками "Предыдущая/Следующая"
- **Информация** о текущем положении

### Выбор изображений
- **Одиночный выбор** - клик выбирает изображение
- **Множественный выбор** - клик добавляет/убирает из выбора
- **Визуальная индикация** - выбранные изображения подсвечиваются
- **Лимит выбора** - ограничение максимального количества

## Accessibility

- Все интерактивные элементы имеют `aria-label`
- Поддержка клавиатурной навигации
- Семантическая разметка
- Контрастные цвета

## Темная тема

Компонент автоматически адаптируется к темной теме через:
- CSS классы `dark`
- HeroUI компоненты с `variant="bordered"`
- Кастомные цвета через `classNames` 