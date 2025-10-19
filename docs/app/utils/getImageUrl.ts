const getImageUrl = (url: string) => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || ''
  const host = baseUrl.replace(/\/?api\/?$/, '') // strip trailing /api or /api/
  if (!url) return host
  if (/^https?:\/\//i.test(url)) return url
  const normalizedPath = url.startsWith('/') ? url : `/${url}`
  return `${host}${normalizedPath}`
}

export { getImageUrl }
