import styles from './FAB.module.css'

export default function FAB({ onClick }) {
  return (
    <button className={styles.fab} onClick={onClick} aria-label="Добавить запас">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 1V13M1 7H13" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  )
}
