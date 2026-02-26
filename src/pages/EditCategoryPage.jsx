import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import SupplyCard from '../components/SupplyCard'
import { useCategories } from '../hooks/useFirestore'
import { useSupplies } from '../hooks/useFirestore'
import styles from './EditCategoryPage.module.css'

export default function EditCategoryPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { categories, updateCategory, deleteCategory } = useCategories()
  const { supplies, deleteSupply } = useSupplies()

  const category = categories.find((c) => c.id === categoryId)
  const [name, setName] = useState(category?.name || '')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (category) setName(category.name)
  }, [category?.id])

  const catSupplies = supplies.filter((s) => s.categoryId === categoryId)

  const handleDeleteSupply = async (supply) => {
    if (!window.confirm(`Удалить «${supply.name}»?`)) return
    await deleteSupply(supply.id)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteCategory(categoryId)
      navigate(-1)
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      if (trimmed !== category?.name) {
        await updateCategory(categoryId, trimmed)
      }
      navigate(-1)
    } finally {
      setSaving(false)
    }
  }

  if (!category && categories.length > 0) {
    return (
      <div className={styles.page}>
        <PageHeader title="Изменить категорию" subtitle="Дом" variant="sub" />
        <p style={{ padding: 16, color: 'var(--light-grey)', font: 'var(--text-small)' }}>
          Категория не найдена
        </p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <PageHeader title="Изменить категорию" subtitle="Дом" variant="sub" />

      <div className={styles.content}>
        <div className={styles.inputRow}>
          <input
            className={styles.catInput}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Название категории"
          />
        </div>

        {catSupplies.length > 0 && (
          <>
            <p className={styles.sectionLabel}>Содержание категории</p>
            <div className={styles.supplyList}>
              {catSupplies.map((s) => (
                <SupplyCard key={s.id} supply={s} onClick={() => handleDeleteSupply(s)} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className={styles.footer}>
        {confirmDelete ? (
          <div className={styles.confirmRow}>
            <button className={styles.cancelBtn} onClick={() => setConfirmDelete(false)}>
              Отмена
            </button>
            <button className={styles.confirmDeleteBtn} onClick={handleDelete} disabled={deleting}>
              {deleting ? '...' : 'Удалить'}
            </button>
          </div>
        ) : (
          <>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving || !name.trim()}
            >
              {saving ? '...' : 'Сохранить'}
            </button>
            <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>
              Удалить категорию
            </button>
          </>
        )}
      </div>
    </div>
  )
}
