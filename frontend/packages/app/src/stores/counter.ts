import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)
  const name = ref('Vue 3 + Pinia')

  // Getters
  const doubleCount = computed(() => count.value * 2)

  // Actions
  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function setName(newName: string) {
    name.value = newName
  }

  return {
    count,
    name,
    doubleCount,
    increment,
    decrement,
    setName
  }
})