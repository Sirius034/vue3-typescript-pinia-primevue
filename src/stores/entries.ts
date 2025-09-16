import { reactive, watch } from 'vue'
import { defineStore } from 'pinia'

import type { Entry } from "./types"

export const useEntriesStore = defineStore('entries', () => {
  const localStorageName = "entries"
  const initValue:Entry[] = JSON.parse(localStorage?.getItem(localStorageName) ?? '[]')
  const entries = reactive(initValue)

  watch(
    entries,
    () => {
      localStorage.setItem('entries', JSON.stringify(entries))
    }
  )

  return { entries }
})
