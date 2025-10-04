// import { api } from "@/app/api"
// import { useMutation, useQueryClient } from "@tanstack/react-query"
// import { useNavigate } from "react-router"
// import { useAuthStore } from "@/app/store/authStore"

// const useLogout = () => {
//   const navigate = useNavigate()
//   const queryClient = useQueryClient()
//   const { setIsAuthenticated, setIsAuthFromSent } = useAuthStore()

//   const { mutate, isPending } = useMutation({
//     mutationKey: ['logout'],
//     mutationFn: () => api.post('/auth/logout'),
//     retry: false,
//     onSuccess: () => {
//       localStorage.removeItem('accessToken')
      
//       setIsAuthenticated(false)
//       setIsAuthFromSent(false)

//       queryClient.invalidateQueries({ queryKey: ['user'] })
//       queryClient.removeQueries({ queryKey: ['user'] })

//       navigate('/login', { replace: true })
//     }
//   })

//   return { logout: mutate, isPending }
// }

// export { useLogout }