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

export default function SupplyCard({ supply, onClick }) {
  const { emoji = '📦', name, quantity, unit, expiryDate } = supply
  const expiry = expiryDate ? formatExpiry(expiryDate) : null
  const Tag = onClick ? 'button' : 'div'

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
