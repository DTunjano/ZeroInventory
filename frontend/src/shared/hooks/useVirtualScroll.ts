import { useCallback, useEffect, useRef, useState } from 'react'

interface UseVirtualOptions {
  overscan?: number
  itemHeight: number
}

export function useVirtualScroll<T>(
  items: T[],
  { overscan = 4, itemHeight }: UseVirtualOptions,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(items.length)

  const totalHeight = items.length * itemHeight

  const updateRange = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const scrollTop = container.scrollTop
    const visibleHeight = container.clientHeight

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + visibleHeight) / itemHeight) + overscan,
    )

    setStartIndex(start)
    setEndIndex(end)
  }, [items.length, itemHeight, overscan])

  useEffect(() => {
    updateRange()
  }, [updateRange])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', updateRange, { passive: true })
    return () => container.removeEventListener('scroll', updateRange)
  }, [updateRange])

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updateRange()
    })

    const container = containerRef.current
    if (container) {
      resizeObserver.observe(container)
    }

    return () => resizeObserver.disconnect()
  }, [updateRange])

  const virtualItems = items
    .slice(startIndex, endIndex)
    .map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }))

  return {
    containerRef,
    virtualItems,
    totalHeight,
    startIndex,
  }
}
