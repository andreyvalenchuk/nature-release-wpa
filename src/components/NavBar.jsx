import { useRef, useState, useEffect } from 'react'
import styles from './NavBar.module.css'

/**
 * NavBar — горизонтальный таб-свитчер.
 * items: Array<{ id, label }>
 * activeId: string
 * onSelect: (id) => void
 * onLongPress?: (id) => void — вызывается при удержании таба (500ms)
 */
export default function NavBar({ items, activeId, onSelect, onLongPress }) {
  const pressTimer = useRef(null)
  const didLongPress = useRef(false)
  const barRef = useRef(null)
  const [overflowing, setOverflowing] = useState(false)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const ro = new ResizeObserver(() => {
      setOverflowing(bar.scrollWidth > bar.offsetWidth)
    })
    ro.observe(bar)
    return () => ro.disconnect()
  }, [items])

  const startPress = (id) => {
    didLongPress.current = false
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true
      onLongPress?.(id)
    }, 500)
  }

  const cancelPress = () => {
    clearTimeout(pressTimer.current)
  }

  const handleClick = (id) => {
    if (didLongPress.current) return
    onSelect(id)
  }

  return (
    <nav className={styles.nav} aria-label="Навигация">
      <div ref={barRef} className={`${styles.bar} ${overflowing ? styles.overflowing : ''} no-scrollbar`}>
        {items.map((item) => (
          <button
            key={item.id}
            className={`${styles.tab} ${item.id === activeId ? styles.active : ''}`}
            onClick={() => handleClick(item.id)}
            onPointerDown={() => startPress(item.id)}
            onPointerUp={cancelPress}
            onPointerLeave={cancelPress}
            onPointerCancel={cancelPress}
            onContextMenu={(e) => e.preventDefault()}
            aria-selected={item.id === activeId}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
