const addUrl = (url: string) => {
  // return process.env.BACKEND_URL + url
  return `http://localhost:5173/activate/${url}`
}

export { addUrl }