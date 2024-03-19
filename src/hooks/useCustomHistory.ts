import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const useCustomHistory = () => {
  const router = useRouter()
  const [pathStack, setPathStack] = useState([])

  useEffect(() => {
    const handleRouteChange = (url) => {
      setPathStack((prevStack) => [...prevStack, url])
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])

  const navigateBack = () => {
    const newPathStack = [...pathStack]
    newPathStack.pop() // Remove current page
    const lastPath = newPathStack.pop() // Get the last page

    if (lastPath) {
      router.push(lastPath)
    } else {
      // Fallback if history is empty
      router.push('/')
    }
  }

  // Calculate lastPath without modifying the original pathStack
  const getLastPath = () => {
    if (pathStack.length < 2) {
      return '/' // Default or fallback path if no history is available
    } else {
      return pathStack[pathStack.length - 2] // Second last item in the array
    }
  }

  return { navigateBack, lastPath: getLastPath() }
}

export default useCustomHistory
