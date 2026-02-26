import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import NavBar from '../components/NavBar'
import EmojiPicker, { UnitPicker } from '../components/EmojiPicker'
import { useCategories } from '../hooks/useFirestore'
import { useSupplies } from '../hooks/useFirestore'
import styles from './SupplyFormPage.module.css'

export default function AddSupplyPage() {
  const navigate = useNavigate()
  const { categories } = useCategories()
  const { addSupply } = useSupplies()

  const [emoji, setEmoji] = useState('')
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('г')
  const [expiryDate, setExpiryDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navItems = [
    { id: '', label: 'Без категории' },
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ]

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Введите название продукта'); return }
    setError('')
    setLoading(true)
    try {
      await addSupply({
        emoji: emoji || '📦',
        name: name.trim(),
        quantity: quantity ? parseFloat(quantity) : null,
        unit: quantity ? unit : null,
        expiryDate: expiryDate || null,
        categoryId: categoryId || null,
      })
      navigate('/')
    } catch {
      setError('Ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }

  const preview = {
    emoji: emoji || '👻',
    name: name || 'Название продукта или блюда',
    quantity: quantity || '0',
    unit,
    expiryDate: expiryDate || null,
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBlock}>
        <PageHeader title="Добавить запас" subtitle="Дом" variant="sub" />
        <PreviewCard preview={preview} quantity={quantity} expiryDate={expiryDate} />
      </div>

      <p className={styles.catLabel}>Выберите категорию запаса</p>
      <NavBar items={navItems} activeId={categoryId} onSelect={setCategoryId} />

      <div className={styles.fields}>
        <EmojiPicker value={emoji} onChange={setEmoji} />

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            type="text"
            placeholder="Название продукта или блюда"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
          />
        </div>

        <QuantityRow quantity={quantity} setQuantity={setQuantity} unit={unit} setUnit={setUnit} styles={styles} />

        <div className={styles.inputRow}>
          <input
            className={`${styles.input} ${!expiryDate ? styles.inputPlaceholderOnly : ''}`}
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div className={styles.footer}>
        <button
          className={`${styles.saveBtn} ${name.trim() ? styles.saveBtnActive : ''}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '...' : 'Добавить запас'}
        </button>
      </div>
    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

export function PreviewCard({ preview, quantity, expiryDate }) {
  return (
    <div className={styles.previewCard}>
      <div className={styles.previewLeft}>
        <span className={styles.previewEmoji}>{preview.emoji}</span>
        <div className={styles.previewInfo}>
          <span className={styles.previewName}>{preview.name}</span>
          <span className={styles.previewSub}>
            {expiryDate
              ? new Date(expiryDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'Дата истечения срока годности'}
          </span>
        </div>
      </div>
      <div className={styles.previewCounter}>
        <span className={styles.previewQty}>{preview.quantity}</span>
        {quantity && <span className={styles.previewUnit}>{preview.unit}</span>}
      </div>
    </div>
  )
}

export function QuantityRow({ quantity, setQuantity, unit, setUnit, styles }) {
  return (
    <>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          type="text"
          inputMode="decimal"
          placeholder="Кол-во продукта или блюда"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      {quantity && <UnitPicker value={unit} onChange={setUnit} />}
    </>
  )
}
