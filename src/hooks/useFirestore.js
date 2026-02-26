import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

// Hook for categories
export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'categories'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  const addCategory = (name) => {
    if (!user) return
    return addDoc(collection(db, 'users', user.uid, 'categories'), {
      name,
      createdAt: serverTimestamp(),
    })
  }

  const updateCategory = (id, name) => {
    if (!user) return
    return updateDoc(doc(db, 'users', user.uid, 'categories', id), { name })
  }

  const deleteCategory = (id) => {
    if (!user) return
    return deleteDoc(doc(db, 'users', user.uid, 'categories', id))
  }

  return { categories, loading, addCategory, updateCategory, deleteCategory }
}

// Hook for supplies
export function useSupplies() {
  const { user } = useAuth()
  const [supplies, setSupplies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'supplies'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setSupplies(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  const addSupply = (data) => {
    if (!user) return
    return addDoc(collection(db, 'users', user.uid, 'supplies'), {
      ...data,
      createdAt: serverTimestamp(),
    })
  }

  const updateSupply = (id, data) => {
    if (!user) return
    return updateDoc(doc(db, 'users', user.uid, 'supplies', id), data)
  }

  const deleteSupply = (id) => {
    if (!user) return
    return deleteDoc(doc(db, 'users', user.uid, 'supplies', id))
  }

  return { supplies, loading, addSupply, updateSupply, deleteSupply }
}
