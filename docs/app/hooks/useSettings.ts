import { api } from "@/api"
import { useQuery } from "@tanstack/react-query"
import { useSettingsStore } from "@/store/settings"
import { useEffect } from "react"

const useSettings = () => {
    const { data: docsConfig, isLoading, error } = useQuery({
        queryKey: ['docs-config'],
        queryFn: () => api.get('/docs/config/public'),
        select: (data) => data.data,
    })

    useEffect(() => {
        if (docsConfig) {
            useSettingsStore.setState({ docsConfig })
        }
    }, [docsConfig])

    return { docsConfig, isLoading, error }
}

export { useSettings }