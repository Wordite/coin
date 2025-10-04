

const Loading = () => {
  return (
    <div className="absolute inset-0 z-50 flex items-center rounded-xxl justify-center bg-gray-transparent-70 backdrop-blur-sm w-full h-full">
      <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-blue-500"></div>
    </div>
  )
}

export { Loading }