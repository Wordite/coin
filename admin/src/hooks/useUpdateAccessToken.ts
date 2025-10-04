// import { useState } from 'react'
// import { api } from '@/app/api'
// import { useQuery } from '@tanstack/react-query'

// const useUpdateAccessToken = () => {
//   const [enabled, setEnabled] = useState(false)

//   const { data } = useQuery({
//     queryKey: ['update-access-token'],
//     queryFn: () => api.get('/auth/access'),
//     refetchInterval: 1000 * 4,
//     enabled,
//   })

//   const startUpdating = () => setEnabled(true)
//   const stopUpdating = () => setEnabled(false)

//   const accessToken = data?.data.accessToken

//   return { startUpdating, stopUpdating }
// }

// export { useUpdateAccessToken }
