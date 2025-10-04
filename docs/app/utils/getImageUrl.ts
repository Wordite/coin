const getImageUrl = (url: string) => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL
  const emptyUrl = baseUrl.replace('/api', '')
  return `${emptyUrl}${url}`
}

export { getImageUrl }
