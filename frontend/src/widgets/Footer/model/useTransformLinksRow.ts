const useTransformLinksRow = () => {
  return {
    transformLinks: (links: { textField1: string; textField2: string }[] | undefined) => {
      if (!links || !Array.isArray(links)) return []
      return links.map((link) => ({
        title: link.textField1,
        link: link.textField2,
      }))
    },
  }
}

export { useTransformLinksRow }
