import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './AuthPage.module.css'

// Google SVG logo
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.2C9.5 35.5 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C37 38.1 44 32.9 44 24c0-1.3-.1-2.5-.4-3.9z" />
    </svg>
  )
}

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signUp, signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await signUp(email, password, name)
      } else {
        await signIn(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.logo}>🥫</div>
        <h1 className={styles.appName}>Полка</h1>
        <p className={styles.tagline}>Трекер продуктов дома</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === 'register' && (
            <input
              className={styles.input}
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          )}
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          />

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.btnPrimary} type="submit" disabled={loading}>
            {loading ? '...' : mode === 'register' ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>или</span>
        </div>

        <button className={styles.btnGoogle} onClick={handleGoogle} disabled={loading}>
          <GoogleIcon />
          Войти через Google
        </button>

        <button
          className={styles.switchMode}
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
        >
          {mode === 'login' ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  )
}

function friendlyError(code) {
  const messages = {
    'auth/email-already-in-use': 'Этот email уже используется',
    'auth/invalid-email': 'Некорректный email',
    'auth/weak-password': 'Пароль слишком слабый (минимум 6 символов)',
    'auth/user-not-found': 'Пользователь не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
    'auth/popup-closed-by-user': 'Окно входа закрыто',
  }
  return messages[code] || 'Произошла ошибка. Попробуйте снова'
}
