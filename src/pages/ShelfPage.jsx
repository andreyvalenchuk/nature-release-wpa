import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import NavBar from '../components/NavBar'
import SupplyCard from '../components/SupplyCard'
import FAB from '../components/FAB'
import { useCategories } from '../hooks/useFirestore'
import { useSupplies } from '../hooks/useFirestore'
import styles from './ShelfPage.module.css'

const EXAMPLE_CATEGORIES = ['Ягоды', 'Молочка', 'Рыба и Мясо']

function useIsWide() {
  const [wide, setWide] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e) => setWide(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return wide
}

// Empty state illustration (squiggly arrow)
function EmptyState() {
  return (
    <div className={styles.emptyWrap}>
      <p className={styles.emptyText}>
        На полке ничего нет, но можно добавить запасы по кнопке «+» в правом нижнем углу
      </p>
      <svg className={styles.arrow} viewBox="0 0 360 600" fill="none" aria-hidden="true">
        <path
          d="M180 20 C 80 120, 300 200, 100 300 C -80 400, 260 480, 340 560"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M325 550 L340 560 L330 545"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function CategoryGroup({ name, items, onCardClick, wide, onQuantityChange }) {
  return (
    <div className={styles.categoryGroup}>
      <div className={styles.chapterRow}>
        <span className={styles.chapterName}>{name}</span>
        <span className={styles.chapterCount}>({items.length})</span>
      </div>
      <div className={wide ? styles.supplyListWide : styles.supplyList}>
        {items.map((s) => (
          <SupplyCard key={s.id} supply={s} onClick={() => onCardClick(s.id)} wide={wide} onQuantityChange={onQuantityChange} />
        ))}
      </div>
    </div>
  )
}

function CategoryTabView({ categories, supplies, activeId, onCardClick, wide, onQuantityChange }) {
  // "Все запасы" tab
  if (activeId === 'all') {
    if (supplies.length === 0) return <EmptyState />

    // Group by category, preserving navbar order
    const grouped = {}
    categories.forEach((cat) => { grouped[cat.id] = { cat, items: [] } })
    const other = []

    supplies.forEach((s) => {
      if (s.categoryId && grouped[s.categoryId]) {
        grouped[s.categoryId].items.push(s)
      } else {
        other.push(s)
      }
    })

    return (
      <div className={styles.allSupplies}>
        {categories.map(({ id, name }) =>
          grouped[id].items.length > 0 ? (
            <CategoryGroup key={id} name={name} items={grouped[id].items} onCardClick={onCardClick} wide={wide} onQuantityChange={onQuantityChange} />
          ) : null
        )}
        {other.length > 0 && (
          <CategoryGroup name="Другое" items={other} onCardClick={onCardClick} wide={wide} onQuantityChange={onQuantityChange} />
        )}
      </div>
    )
  }

  // Category-specific tab — show supply cards
  const catSupplies = supplies.filter((s) => s.categoryId === activeId)
  const category = categories.find((c) => c.id === activeId)

  if (catSupplies.length === 0) {
    return (
      <div className={styles.catEmpty}>
        <p className={styles.emptyText}>
          В категории «{category?.name}» пока нет запасов.
          Нажмите «+» чтобы добавить.
        </p>
      </div>
    )
  }

  return (
    <div className={wide ? styles.supplyListPageWide : styles.supplyListPage}>
      {catSupplies.map((s) => (
        <SupplyCard key={s.id} supply={s} onClick={() => onCardClick(s.id)} wide={wide} onQuantityChange={onQuantityChange} />
      ))}
    </div>
  )
}

function CreateCategoryTab({ onCreated }) {
  const [value, setValue] = useState('')
  const { addCategory } = useCategories()
  const inputRef = useRef(null)

  const handleExample = (example) => {
    setValue(example)
    inputRef.current?.focus()
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    await addCategory(trimmed)
    setValue('')
    onCreated?.()
  }

  return (
    <div className={styles.createCat}>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            className={styles.catInput}
            type="text"
            placeholder="Название категории"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={40}
          />
          {value.trim() && (
            <button type="submit" className={styles.saveBtn}>
              Создать
            </button>
          )}
        </div>
      </form>

      <p className={styles.hint}>
        Создайте первую категорию на вашей полке. Достаточно лишь придумать и ввести название.
        Например:{' '}
        {EXAMPLE_CATEGORIES.map((ex, i) => (
          <span key={ex}>
            <button className={styles.exampleWord} onClick={() => handleExample(ex)}>
              {ex}
            </button>
            {i < EXAMPLE_CATEGORIES.length - 1 ? ', ' : '.'}
          </span>
        ))}
      </p>
    </div>
  )
}

export default function ShelfPage() {
  const navigate = useNavigate()
  const { categories, loading: catsLoading } = useCategories()
  const { supplies, loading: suppliesLoading, updateSupply } = useSupplies()

  const handleQuantityChange = useCallback((id, newQty) => {
    updateSupply(id, { quantity: newQty })
  }, [updateSupply])
  const [activeTab, setActiveTab] = useState('all')
  const isWide = useIsWide()

  const hasCategories = categories.length > 0

  const navItems = [
    { id: 'all', label: 'Все запасы' },
    ...(!hasCategories || activeTab === 'create' ? [{ id: 'create', label: 'Создать категорию' }] : []),
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ]

  // Если все категории удалены и мы были на одной из них — сброс на 'all'
  // Если категории появились и мы были на 'create' — сброс на 'all'
  useEffect(() => {
    const validIds = new Set(navItems.map((i) => i.id))
    if (!validIds.has(activeTab)) {
      setActiveTab('all')
    }
  }, [categories])

  if (catsLoading || suppliesLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loader} />
      </div>
    )
  }

  const isCategoryTab = activeTab !== 'all' && activeTab !== 'create'
  const menuItems = isCategoryTab
    ? [
        { label: 'Изменить категорию', icon: 'edit', onClick: () => navigate(`/edit-category/${activeTab}`) },
        { label: 'Создать категорию', icon: 'add', onClick: () => setActiveTab('create') },
      ]
    : [
        { label: 'Создать категорию', icon: 'add', onClick: () => setActiveTab('create') },
      ]

  return (
    <div className={styles.page}>
      <PageHeader title="Полка" subtitle="Дом" menuItems={menuItems} />
      <NavBar
        items={navItems}
        activeId={activeTab}
        onSelect={setActiveTab}
        onLongPress={(id) => {
          if (id !== 'all' && id !== 'create') {
            navigate(`/edit-category/${id}`)
          }
        }}
      />

      <div className={styles.content}>
        {activeTab === 'create' ? (
          <CreateCategoryTab onCreated={() => setActiveTab('all')} />
        ) : (
          <CategoryTabView
            categories={categories}
            supplies={supplies}
            activeId={activeTab}
            onCardClick={(id) => navigate(`/edit/${id}`)}
            wide={isWide}
            onQuantityChange={handleQuantityChange}
          />
        )}
      </div>

      <FAB onClick={() => navigate('/add')} />
    </div>
  )
}
