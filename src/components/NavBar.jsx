import styles from './NavBar.module.css'

/**
 * NavBar — горизонтальный таб-свитчер.
 * items: Array<{ id, label }>
 * activeId: string
 * onSelect: (id) => void
 */
export default function NavBar({ items, activeId, onSelect }) {
  return (
    <nav className={styles.nav} aria-label="Навигация">
      <div className={`${styles.bar} no-scrollbar`}>
        {items.map((item) => (
          <button
            key={item.id}
            className={`${styles.tab} ${item.id === activeId ? styles.active : ''}`}
            onClick={() => onSelect(item.id)}
            aria-selected={item.id === activeId}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
