import { api } from '../app/api'

export interface ContactResponse {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  lastName: string
  email: string
  phone: string | null
  message: string
  isRead: boolean
}

export interface ContactsListResponse {
  contacts: ContactResponse[]
  total: number
  totalPages: number
  currentPage: number
}

class ContactApi {
  async getContacts(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isRead?: boolean
  ): Promise<ContactsListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (search) {
      params.append('search', search)
    }

    if (isRead !== undefined) {
      params.append('isRead', isRead.toString())
    }

    const response = await api.get(`/contact?${params}`)
    return response.data
  }

  async getContactById(id: string): Promise<ContactResponse | null> {
    try {
      const response = await api.get(`/contact/${id}`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  async markAsRead(id: string): Promise<ContactResponse> {
    const response = await api.put(`/contact/${id}/read`)
    return response.data
  }

  async markAsUnread(id: string): Promise<ContactResponse> {
    const response = await api.put(`/contact/${id}/unread`)
    return response.data
  }

  async deleteContact(id: string): Promise<void> {
    await api.delete(`/contact/${id}`)
  }

  async deleteAllRead(): Promise<{ deletedCount: number }> {
    const response = await api.delete('/contact/delete-all-read')
    return response.data
  }

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/contact/unread-count')
    return response.data.count
  }

  async getReadCount(): Promise<number> {
    const response = await api.get('/contact/read-count')
    return response.data.count
  }
}

export const contactApi = new ContactApi()
