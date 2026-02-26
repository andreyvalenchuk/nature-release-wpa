import { useState, useEffect, useRef } from 'react'
import styles from './PageHeader.module.css'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

// Three dots icon
function DotsIcon() {
  return (
    <svg width="4" height="16" viewBox="0 0 4 16" fill="none" aria-hidden="true">
      <circle cx="2" cy="2" r="2" fill="white" />
      <circle cx="2" cy="8" r="2" fill="white" />
      <circle cx="2" cy="14" r="2" fill="white" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M8.5 1.5L10.5 3.5L3.5 10.5H1.5V8.5L8.5 1.5Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AddIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <line x1="6" y1="0.75" x2="6" y2="11.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="0.75" y1="6" x2="11.25" y2="6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const MENU_ICONS = { edit: EditIcon, add: AddIcon }

// Back arrow icon
function BackIcon() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
      <path d="M9 1L2 8L9 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * PageHeader — верхняя шапка страницы.
 * variant="main"  — аватар слева, три точки справа (главная страница)
 * variant="sub"   — стрелка назад слева, три точки справа (вложенная страница)
 * menuItems — Array<{ label, onClick }>, если передан — три точки открывают попап
 */
export default function PageHeader({
  title = 'Полка',
  subtitle = 'Дом',
  variant = 'main',
  onBack,
  onMenu,
  menuItems,
}) {
  const { user, logOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuWrapRef = useRef(null)

  // Закрываем попап при клике вне его
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [menuOpen])

  const handleBack = () => {
    if (onBack) return onBack()
    navigate(-1)
  }

  const handleMenu = () => {
    if (menuItems) {
      setMenuOpen((v) => !v)
      return
    }
    if (onMenu) return onMenu()
    // Default: show logout option
    if (window.confirm('Выйти из аккаунта?')) {
      logOut()
    }
  }

  return (
    <header className={styles.header}>
      {/* Left action */}
      {variant === 'main' ? (
        <button className={styles.avatarBtn} onClick={handleMenu} aria-label="Меню">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'Профиль'} className={styles.avatar} />
          ) : (
            <span className={styles.avatarFallback}>
              {(user?.displayName || user?.email || '?')[0].toUpperCase()}
            </span>
          )}
        </button>
      ) : (
        <button className={styles.actionBtn} onClick={handleBack} aria-label="Назад">
          <BackIcon />
        </button>
      )}

      {/* Center title */}
      <div className={styles.titleBlock}>
        <span className={styles.title}>{title}</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </div>

      {/* Right action + dropdown menu */}
      <div className={styles.menuWrap} ref={menuWrapRef}>
        <button className={styles.actionBtn} onClick={handleMenu} aria-label="Дополнительно">
          <DotsIcon />
        </button>
        {menuOpen && menuItems && (
          <div className={styles.menu}>
            {menuItems.map((item, i) => {
              const Icon = item.icon ? MENU_ICONS[item.icon] : null
              return (
                <button
                  key={i}
                  className={styles.menuItem}
                  onClick={() => {
                    setMenuOpen(false)
                    item.onClick()
                  }}
                >
                  {Icon && <span className={styles.menuIcon}><Icon /></span>}
                  {item.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </header>
  )
}
