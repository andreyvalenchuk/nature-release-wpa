import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      clearTimeout(timeout)
      setUser(currentUser)
      setLoading(false)
    })
    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  const signUp = (email, password, name) =>
    createUserWithEmailAndPassword(auth, email, password).then(({ user }) =>
      updateProfile(user, { displayName: name })
    )

  const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const signInWithGoogle = () =>
    signInWithPopup(auth, new GoogleAuthProvider())

  const logOut = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, logOut }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
