import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './SupplyCard.module.css'

function formatExpiry(dateStr) {
  if (!dateStr) return null
  const expiry = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)
  const diff = Math.round((expiry - now) / (1000 * 60 * 60 * 24))

  if (diff < 0) return { label: `Просрочено ${Math.abs(diff)} дн. назад`, expired: true }
  if (diff === 0) return { label: 'Истекает сегодня', expired: true }
  if (diff === 1) return { label: 'Истекает завтра', expired: false, warn: true }
  if (diff <= 3) return { label: `Истекает через ${diff} дня`, expired: false, warn: true }
  return { label: `Истекает через ${diff} дней`, expired: false }
}

// Slot-machine number: new digit rolls in from top or bottom
function RollingNumber({ value, dir, animKey, className }) {
  return (
    <span className={styles.qtyViewport}>
      <span
        key={animKey}
        className={`${className}${dir === 'up' ? ' ' + styles.animUp : dir === 'down' ? ' ' + styles.animDown : ''}`}
      >
        {value}
      </span>
    </span>
  )
}

export default function SupplyCard({ supply, onClick, wide, onQuantityChange }) {
  const { emoji = '📦', name, quantity, unit, expiryDate } = supply
  const expiry = expiryDate ? formatExpiry(expiryDate) : null
  const Tag = onClick ? 'button' : 'div'
  const expiryClass = `${styles.expiry}${expiry?.expired ? ' ' + styles.expired : expiry?.warn ? ' ' + styles.warn : ''}`

  const parsedQty = parseFloat(quantity)
  const isNumeric = !isNaN(parsedQty)

  const [localQty, setLocalQty] = useState(isNumeric ? parsedQty : 0)
  const [animDir, setAnimDir] = useState(null)
  const [animKey, setAnimKey] = useState(0)
  const debounceRef = useRef(null)
  const isPendingRef = useRef(false)

  // Sync from Firestore when not in the middle of user edits
  useEffect(() => {
    if (!isPendingRef.current && isNumeric) {
      setLocalQty(parsedQty)
    }
  }, [quantity]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMinus = useCallback(
    (e) => {
      e.stopPropagation()
      if (!isNumeric || localQty <= 0) return
      const newQty = localQty - 1
      setLocalQty(newQty)
      setAnimDir('up')
      setAnimKey((k) => k + 1)
      isPendingRef.current = true
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onQuantityChange?.(supply.id, String(newQty))
        isPendingRef.current = false
      }, 700)
    },
    [localQty, isNumeric, supply.id, onQuantityChange]
  )

  const handlePlus = useCallback(
    (e) => {
      e.stopPropagation()
      if (!isNumeric) return
      const newQty = localQty + 1
      setLocalQty(newQty)
      setAnimDir('down')
      setAnimKey((k) => k + 1)
      isPendingRef.current = true
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onQuantityChange?.(supply.id, String(newQty))
        isPendingRef.current = false
      }, 700)
    },
    [localQty, isNumeric, supply.id, onQuantityChange]
  )

  if (wide) {
    return (
      <Tag className={`${styles.card} ${styles.wide}`} onClick={onClick}>
        <div className={styles.logoname}>
          <span className={styles.emoji}>{emoji}</span>
          <div className={styles.info}>
            <span className={styles.name}>{name}</span>
            {expiry && <span className={expiryClass}>{expiry.label}</span>}
          </div>
        </div>
        {quantity && (
          <div className={styles.counterRow}>
            <div
              className={`${styles.counterSide}${!isNumeric || localQty <= 0 ? ' ' + styles.counterSideDim : ''}`}
              onClick={handleMinus}
            >
              <svg width="12" height="2" viewBox="0 0 12 2" fill="none" aria-hidden="true">
                <line x1="0" y1="1" x2="12" y2="1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.counterAmount}>
              {isNumeric ? (
                <RollingNumber
                  value={String(localQty)}
                  dir={animDir}
                  animKey={animKey}
                  className={styles.qty}
                />
              ) : (
                <span className={styles.qty}>{quantity}</span>
              )}
              {unit && <span className={styles.unit}>{unit}</span>}
            </div>
            <div
              className={`${styles.counterSide}${!isNumeric ? ' ' + styles.counterSideDim : ''}`}
              onClick={handlePlus}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <line x1="6" y1="0.75" x2="6" y2="11.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="0.75" y1="6" x2="11.25" y2="6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        )}
      </Tag>
    )
  }

  return (
    <Tag className={styles.card} onClick={onClick}>
      <div className={styles.left}>
        <span className={styles.emoji}>{emoji}</span>
        <div className={styles.info}>
          <span className={styles.name}>{name}</span>
          {expiry && (
            <span className={`${styles.expiry} ${expiry.expired ? styles.expired : expiry.warn ? styles.warn : ''}`}>
              {expiry.label}
            </span>
          )}
        </div>
      </div>
      {quantity && (
        <div className={styles.counter}>
          <span className={styles.qty}>{quantity}</span>
          {unit && <span className={styles.unit}>{unit}</span>}
        </div>
      )}
    </Tag>
  )
}
