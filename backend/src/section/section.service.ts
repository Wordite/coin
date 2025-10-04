import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { CreateSectionTypeDto } from './dto/create-section-type.dto'
import { UpdateSectionTypeDto } from './dto/update-section-type.dto'

@Injectable()
export class SectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async createSectionType(createSectionTypeDto: CreateSectionTypeDto) {
    const { fields, ...sectionTypeData } = createSectionTypeDto

    return this.prisma.sectionType.create({
      data: {
        ...sectionTypeData,
        fields: {
          create: fields.map((field, index) => ({
            ...field,
            order: field.order ?? index,
          })),
        },
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    })
  }

  async findAllSectionTypes() {
    return this.prisma.sectionType.findMany({
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { sections: true },
        },
      },
    })
  }

  async findSectionTypeById(id: string) {
    const sectionType = await this.prisma.sectionType.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        sections: true,
      },
    })

    if (!sectionType) {
      throw new NotFoundException(`Section type with ID ${id} not found`)
    }

    return sectionType
  }

  async updateSectionType(id: string, updateSectionTypeDto: UpdateSectionTypeDto) {
    const { fields, ...sectionTypeData } = updateSectionTypeDto

    let oldFields: any[] = []

    if (fields) {
      oldFields = await this.prisma.sectionField.findMany({
        where: { sectionTypeId: id },
        orderBy: { order: 'asc' },
      })

      await this.prisma.sectionField.deleteMany({
        where: { sectionTypeId: id },
      })
    }

    const updatedSectionType = await this.prisma.sectionType.update({
      where: { id },
      data: {
        ...sectionTypeData,
        ...(fields && {
          fields: {
            create: fields.map((field, index) => ({
              ...field,
              order: field.order ?? index,
            })),
          },
        }),
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (fields) {
      await this.updateSectionsContentForType(id, fields, oldFields)
    }

    return updatedSectionType
  }

  private async updateSectionsContentForType(
    sectionTypeId: string,
    newFields: any[],
    oldFields: any[] = []
  ) {
    const sections = await this.prisma.section.findMany({
      where: { sectionTypeId },
      select: { id: true, content: true },
    })

    const fieldMapping = this.createFieldMapping(oldFields, newFields)

    for (const section of sections) {
      const currentContent = (section.content as Record<string, any>) || {}
      const updatedContent: Record<string, any> = {}

      newFields.forEach((newField, index) => {
        const newFieldName = newField.name

        const mappedOldFieldName = fieldMapping[newFieldName]

        if (mappedOldFieldName && currentContent[mappedOldFieldName] !== undefined) {
          const oldValue = currentContent[mappedOldFieldName]
          if (this.isTypeCompatible(oldValue, newField.type)) {
            updatedContent[newFieldName] = oldValue
          } else {
            updatedContent[newFieldName] = this.getDefaultValue(newField)
          }
        } else if (currentContent[newFieldName] !== undefined) {
          updatedContent[newFieldName] = currentContent[newFieldName]
        } else {
          updatedContent[newFieldName] = this.getDefaultValue(newField)
        }
      })

      await this.prisma.section.update({
        where: { id: section.id },
        data: { content: updatedContent },
      })
    }
  }

  private createFieldMapping(oldFields: any[], newFields: any[]): Record<string, string> {
    const mapping: Record<string, string> = {}

    const minLength = Math.min(oldFields.length, newFields.length)

    for (let i = 0; i < minLength; i++) {
      const oldField = oldFields[i]
      const newField = newFields[i]

      if (oldField.type === newField.type && oldField.name !== newField.name) {
        mapping[newField.name] = oldField.name
      }
    }

    return mapping
  }

  private isTypeCompatible(value: any, newType: string): boolean {
    if (newType === 'IMAGES') {
      return Array.isArray(value)
    } else if (newType === 'COMPLEX') {
      return Array.isArray(value) || (typeof value === 'string' && value.startsWith('['))
    } else if (newType === 'CONTENT' || newType === 'MARKDOWN') {
      return typeof value === 'string'
    }
    return false
  }

  private getDefaultValue(field: any): any {
    if (field.type === 'IMAGES') {
      return []
    } else if (field.type === 'COMPLEX') {
      return []
    } else {
      return field.defaultValue || ''
    }
  }

  async deleteSectionType(id: string) {
    const sectionsCount = await this.prisma.section.count({
      where: { sectionTypeId: id },
    })

    if (sectionsCount > 0) {
      throw new Error(`Cannot delete section type. ${sectionsCount} sections are using it.`)
    }

    return this.prisma.sectionType.delete({
      where: { id },
    })
  }

  async findAllSections() {
    return this.prisma.section.findMany({
      include: {
        sectionType: {
          include: {
            fields: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })
  }

  async findSectionById(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        sectionType: {
          include: {
            fields: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`)
    }

    return section
  }

  async createSection(data: { name: string; link: string; content?: any; sectionTypeId?: string }) {
    return this.prisma.section.create({
      data,
      include: {
        sectionType: {
          include: {
            fields: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })
  }

  async updateSection(
    id: string,
    data: { name?: string; link?: string; content?: any; sectionTypeId?: string }
  ) {
    const oldSection = await this.prisma.section.findUnique({
      where: { id },
      select: { link: true },
    })

    const updatedSection = await this.prisma.section.update({
      where: { id },
      data,
      include: {
        sectionType: {
          include: {
            fields: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    if (oldSection?.link) {
      await this.invalidateSectionCache(oldSection.link)
    }
    if (data.link && data.link !== oldSection?.link) {
      await this.invalidateSectionCache(data.link)
    }

    return updatedSection
  }

  async deleteSection(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      select: { link: true },
    })

    const deletedSection = await this.prisma.section.delete({
      where: { id },
    })

    if (section?.link) {
      await this.invalidateSectionCache(section.link)
    }

    return deletedSection
  }

  async findSectionByUrl(url: string) {
    const section = await this.prisma.section.findUnique({
      where: { link: url },
      include: {
        sectionType: {
          include: {
            fields: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    if (!section) {
      throw new NotFoundException(`Section with URL ${url} not found`)
    }

    return section
  }

  async findPublicSectionByUrl(url: string) {
    const cacheKey = `section:public:${url}`

    try {
      const cachedData = await this.redis.get(cacheKey)
      if (cachedData) {
        return JSON.parse(cachedData)
      }
    } catch (error) {
      console.warn('Redis cache read error:', error)
    }

    const section = await this.prisma.section.findUnique({
      where: { link: url },
      include: {
        sectionType: {
          include: {
            fields: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    if (!section) {
      throw new NotFoundException(`Section with URL ${url} not found`)
    }

    const processedContent = this.processContentForFrontend(
      section.content,
      section.sectionType || undefined
    )

    const result = {
      id: section.id,
      name: section.name,
      link: section.link,
      content: processedContent,
      sectionType: section.sectionType
        ? {
            id: section.sectionType.id,
            name: section.sectionType.name,
            fields: section.sectionType.fields.map((field) => ({
              id: field.id,
              name: field.name,
              type: field.type,
              validation: field.validation,
              textFieldsCount: field.textFieldsCount || undefined,
            })),
          }
        : null,
    }

    try {
      await this.redis.setex(cacheKey, 420, JSON.stringify(result))
    } catch (error) {
      console.warn('Redis cache write error:', error)
    }

    return result
  }

  private processContentForFrontend(content: any, sectionType?: any) {
    const processedContent: Record<string, any> = {}

    if (!content || typeof content !== 'object') {
      content = {}
    }

    Object.keys(content).forEach((fieldName) => {
      const fieldContent = content[fieldName]

      if (fieldContent !== undefined && fieldContent !== null) {
        const fieldConfig = sectionType?.fields?.find((f: any) => f.name === fieldName)

        if (fieldConfig?.type === 'COMPLEX' && Array.isArray(fieldContent)) {
          processedContent[fieldName] = fieldContent
        } else if (Array.isArray(fieldContent)) {
          processedContent[fieldName] = this.processImagesForFrontend(fieldContent)
        } else {
          processedContent[fieldName] = fieldContent
        }
      } else {
        processedContent[fieldName] = fieldContent
      }
    })

    return processedContent
  }

  private processImagesForFrontend(images: any[]) {
    if (!Array.isArray(images)) return []

    return images
      .map((image) => {
        try {
          if (image && typeof image === 'object' && 'url' in image) {
            return image.url
          }

          if (typeof image === 'string') {
            return image
          }

          if (image && typeof image === 'object' && 'url' in image) {
            return image.url
          }

          return null
        } catch (error) {
          console.error('Error processing image:', error, image)
          return null
        }
      })
      .filter(Boolean)
  }

  private async invalidateSectionCache(url: string): Promise<void> {
    const cacheKey = `section:public:${url}`
    try {
      await this.redis.del(cacheKey)
    } catch (error) {
      console.warn('Redis cache invalidation error:', error)
    }
  }

  private async invalidateAllSectionCache(): Promise<void> {
    try {
      const keys = await this.redis.keys('section:public:*')
      if (keys.length > 0) {
        for (const key of keys) {
          await this.redis.del(key)
        }
      }
    } catch (error) {
      console.warn('Redis cache invalidation error:', error)
    }
  }
}
