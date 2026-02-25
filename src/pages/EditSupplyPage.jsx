import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import NavBar from '../components/NavBar'
import EmojiPicker, { UNITS } from '../components/EmojiPicker'
import { PreviewCard, QuantityRow } from './AddSupplyPage'
import { useCategories } from '../hooks/useFirestore'
import { useSupplies } from '../hooks/useFirestore'
import styles from './SupplyFormPage.module.css'

export default function EditSupplyPage() {
  const { supplyId } = useParams()
  const navigate = useNavigate()
  const { categories } = useCategories()
  const { supplies, updateSupply, deleteSupply } = useSupplies()

  const supply = supplies.find((s) => s.id === supplyId)

  const [emoji, setEmoji] = useState('')
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('г')
  const [expiryDate, setExpiryDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill form when supply loads
  useEffect(() => {
    if (!supply) return
    setEmoji(supply.emoji || '')
    setName(supply.name || '')
    setQuantity(supply.quantity != null ? String(supply.quantity) : '')
    setUnit(supply.unit || 'г')
    setExpiryDate(supply.expiryDate || '')
    setCategoryId(supply.categoryId || '')
  }, [supply?.id])

  const navItems = [
    { id: '', label: 'Без категории' },
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ]

  const handleSave = async () => {
    if (!name.trim()) { setError('Введите название продукта'); return }
    setError('')
    setLoading(true)
    try {
      await updateSupply(supplyId, {
        emoji: emoji || '📦',
        name: name.trim(),
        quantity: quantity ? parseFloat(quantity) : null,
        unit: quantity ? unit : null,
        expiryDate: expiryDate || null,
        categoryId: categoryId || null,
      })
      navigate(-1)
    } catch {
      setError('Ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Удалить «${name}»?`)) return
    setLoading(true)
    try {
      await deleteSupply(supplyId)
      navigate('/')
    } catch {
      setError('Ошибка при удалении')
    } finally {
      setLoading(false)
    }
  }

  if (!supply) {
    return (
      <div className={styles.page}>
        <PageHeader title="Редактировать" subtitle="Дом" variant="sub" />
        <p style={{ padding: 16, color: 'var(--light-grey)', font: 'var(--text-small)' }}>
          Продукт не найден
        </p>
      </div>
    )
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
        <PageHeader title="Редактировать" subtitle="Дом" variant="sub" />
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
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? '...' : 'Сохранить изменения'}
        </button>
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          disabled={loading}
        >
          Удалить продукт
        </button>
      </div>
    </div>
  )
}
