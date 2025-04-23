"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Immobiliare, AnnoControllo } from "@/types/immobiliare"

// Funzione per inizializzare gli anni di controllo predefiniti
const initializeDefaultYears = (): AnnoControllo[] => {
  const currentYear = new Date().getFullYear()
  const years: AnnoControllo[] = []

  // Crea anni dal 2019 all'anno corrente
  for (let year = 2019; year <= currentYear; year++) {
    years.push({
      id: uuidv4(),
      anno: year.toString(),
      attivo: true,
    })
  }

  return years
}

// Funzione per caricare i dati dal localStorage
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue
  
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Errore nel caricamento di ${key}: `, error)
    return defaultValue
  }
}

// Funzione per salvare i dati nel localStorage
const saveToLocalStorage = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Errore nel salvataggio di ${key}:`, error)
  }
}

export function useDatabase() {
  // Carica i dati iniziali dal localStorage
  const [immobiliari, setImmobiliari] = useState<Immobiliare[]>(() => 
    loadFromLocalStorage("immobiliari", [])
  )
  
  const [anniControllo, setAnniControllo] = useState<AnnoControllo[]>(() => 
    loadFromLocalStorage("anniControllo", initializeDefaultYears())
  )

  // Salva i dati nel localStorage quando cambiano
  useEffect(() => {
    saveToLocalStorage("immobiliari", immobiliari)
  }, [immobiliari])

  useEffect(() => {
    saveToLocalStorage("anniControllo", anniControllo)
  }, [anniControllo])

  // Verifica se un'immobiliare è già presente nel database
  const isDuplicate = (codiceFiscale: string): Immobiliare | null => {
    return immobiliari.find((item) => item.codiceFiscale.toLowerCase() === codiceFiscale.toLowerCase()) || null
  }

  // Aggiungi una nuova immobiliare
  const addImmobiliare = (data: Omit<Immobiliare, "id" | "anniControllati">) => {
    const newImmobiliare: Immobiliare = {
      id: uuidv4(),
      ...data,
      anniControllati: anniControllo.reduce(
        (acc, anno) => {
          acc[anno.anno] = false
          return acc
        },
        {} as Record<string, boolean>,
      ),
    }

    setImmobiliari((prev) => [...prev, newImmobiliare])
    return newImmobiliare
  }

  // Aggiorna un'immobiliare esistente
  const updateImmobiliare = (id: string, data: Partial<Immobiliare>) => {
    setImmobiliari((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)))
  }

  // Elimina un'immobiliare
  const deleteImmobiliare = (id: string) => {
    setImmobiliari((prev) => prev.filter((item) => item.id !== id))
  }

  // Aggiorna lo stato di controllo per un anno specifico
  const updateAnnoControllo = (immobiliareId: string, anno: string, controllato: boolean) => {
    setImmobiliari((prev) =>
      prev.map((item) => {
        if (item.id === immobiliareId) {
          return {
            ...item,
            anniControllati: {
              ...item.anniControllati,
              [anno]: controllato,
            },
          }
        }
        return item
      }),
    )
  }

  // Aggiungi un nuovo anno di controllo
  const addAnnoControllo = (anno: string) => {
    // Verifica se l'anno esiste già
    if (anniControllo.some((item) => item.anno === ann
