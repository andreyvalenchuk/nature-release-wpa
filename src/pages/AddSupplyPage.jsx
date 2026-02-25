import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import NavBar from '../components/NavBar'
import { useCategories } from '../hooks/useFirestore'
import { useSupplies } from '../hooks/useFirestore'
import styles from './AddSupplyPage.module.css'

const UNITS = ['г', 'кг', 'мл', 'л', 'шт', 'уп', 'шт.']

// Simple emoji picker with common food emojis
const FOOD_EMOJIS = [
  '🥛','🧀','🥚','🧈','🍗','🥩','🐟','🦐',
  '🫐','🍓','🍇','🍊','🍋','🍎','🍌','🍅',
  '🥕','🧅','🥔','🧄','🫑','🥦','🌽','🥒',
  '🍞','🥐','🍚','🥣','🍝','🥫','🧂','🫙',
  '🍯','☕','🧃','🥤','🫖','🍵','🧊','📦',
]

function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={styles.emojiSection}>
      <button
        type="button"
        className={styles.inputRow}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.emojiPreview}>{value || '👻'}</span>
        <span className={value ? styles.inputText : styles.inputPlaceholder}>
          {value ? 'Эмодзи выбран' : 'Выбрать эмодзи для продукта'}
        </span>
      </button>
      {open && (
        <div className={styles.emojiGrid}>
          {FOOD_EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              className={`${styles.emojiBtn} ${em === value ? styles.emojiBtnActive : ''}`}
              onClick={() => { onChange(em); setOpen(false) }}
            >
              {em}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

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
    { id: '', label: 'Все запасы' },
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ]

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Введите название продукта')
      return
    }
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
    } catch (err) {
      setError('Ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }

  // Currently edited supply preview (first supply card at top)
  const preview = {
    emoji: emoji || '👻',
    name: name || 'Название продукта или блюда',
    quantity: quantity || '0',
    unit: unit,
    expiryDate: expiryDate || null,
  }

  return (
    <div className={styles.page}>
      {/* Top dark block with header + preview card */}
      <div className={styles.topBlock}>
        <PageHeader title="Добавить запас" subtitle="Дом" variant="sub" />

        {/* Preview of what will be saved */}
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
      </div>

      {/* Category selector */}
      <p className={styles.catLabel}>Выберите категорию запаса</p>
      <NavBar
        items={navItems}
        activeId={categoryId}
        onSelect={setCategoryId}
      />

      {/* Form fields */}
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

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            type="number"
            inputMode="decimal"
            placeholder="Кол-во продукта или блюда"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0"
            step="any"
          />
          {quantity && (
            <div className={styles.unitSelector}>
              <select
                className={styles.unitSelect}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <span className={styles.unitArrow}>▾</span>
            </div>
          )}
        </div>

        <div className={styles.inputRow}>
          <input
            className={`${styles.input} ${!expiryDate ? styles.inputPlaceholderOnly : ''}`}
            type="date"
            placeholder="Дата истечения срока годности"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>

      {/* Save button */}
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
