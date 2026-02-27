import { useState } from 'react'
import styles from './EmojiPicker.module.css'

export function UnitPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.preview}>{value}</span>
        <span className={styles.label}>Единица измерения</span>
      </button>
      {open && (
        <div className={styles.grid}>
          {UNITS.map((u) => (
            <button
              key={u}
              type="button"
              className={`${styles.unitBtn} ${u === value ? styles.unitBtnActive : ''}`}
              onClick={() => { onChange(u); setOpen(false) }}
            >
              {u}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const FOOD_EMOJIS = [
  '🍎','🍐','🍊','🍋','🍋‍🟩','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅',
  '🍆','🥑','🫛','🥦','🥬','🥒','🌶','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🫜','🍠','🫚',
  '🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴',
  '🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫',
  '🍝','🍜','🍲','🫙','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮',
  '🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪',
  '🌰','🥜','🫘','🍯','🥛','🫗','🍼','🫖','☕️','🍵','🧃','🥤','🧋','🍶','🍺','🍻',
  '🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊','🍽','🥣','🥡','🧂',
]

export const UNITS = ['г', 'кг', 'мл', 'л', 'шт', 'уп']

export default function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.preview}>{value || '👻'}</span>
        <span className={value ? styles.label : styles.placeholder}>
          {value ? 'Эмодзи выбран' : 'Выбрать эмодзи для продукта'}
        </span>
      </button>
      {open && (
        <div className={styles.grid}>
          {FOOD_EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              className={`${styles.btn} ${em === value ? styles.btnActive : ''}`}
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
