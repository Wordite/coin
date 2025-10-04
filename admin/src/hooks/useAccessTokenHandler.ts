// import { api } from '@/app/api'
// import { useQuery } from '@tanstack/react-query'
// import { useAuthStore } from '@/app/store/authStore'
// import { useEffect } from 'react'

// const useAccessTokenHandler = () => {
//   const { setIsAuthenticated, isAuthFromSent, isAuthenticated } = useAuthStore()

//   const { data, isLoading, isError } = useQuery<{ data: { accessToken: string } }>({
//     queryKey: ['accessToken'],
//     queryFn: () => api.get('/auth/access'),
//     enabled: isAuthFromSent && !isAuthenticated,
//     retry: isAuthFromSent,
//     refetchInterval: 1000 * 4,
//   })

//   // console.log('isAuthFromSent', isAuthFromSent)
//   // console.log('isAuthenticated', isAuthenticated)

//   useEffect(() => {
//     if (data?.data?.accessToken) {
//       localStorage.setItem('accessToken', data.data.accessToken)
//       console.log('accessToken', data.data.accessToken)
//       setIsAuthenticated(true)
//     }
//   }, [data])

//   return { data: data?.data, isLoading, isError }
// }

// export { useAccessTokenHandler }
