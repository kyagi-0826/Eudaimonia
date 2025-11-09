<template>
  <div class="base-sort-component">
    <div 
      class="sort-trigger"
      :class="[
        'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all',
        'hover:bg-gray-100 dark:hover:bg-gray-700',
        sizeClasses,
        { 'bg-blue-50 text-blue-600': isActive }
      ]"
      @click="toggleSort"
      :disabled="disabled"
    >
      <span class="text-sm font-medium">{{ label }}</span>
      <SortIcon 
        :direction="config.direction" 
        :active="isActive"
        class="transition-transform duration-200"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SortProps, SortConfig, SortEmits } from '../types'
import SortIcon from './SortIcon.vue'

// Props
const props = withDefaults(defineProps<SortProps>(), {
  disabled: false,
  size: 'medium',
  theme: 'light'
})

// Emits
const emit = defineEmits<SortEmits>()

// データとソート設定
const localData = ref([...props.data])
const localConfig = ref<SortConfig>({ ...props.config })

// 計算プロパティ
const label = computed(() => localConfig.value.label || localConfig.value.key)
const isActive = computed(() => localConfig.value.direction !== null)

const sizeClasses = computed(() => {
  const sizeMap = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-2',
    large: 'text-base px-4 py-3'
  }
  return sizeMap[props.size]
})

// ソート切り替え
const toggleSort = () => {
  if (props.disabled) return

  // 次の状態を決定
  const currentDirection = localConfig.value.direction
  let nextDirection: 'asc' | 'desc' | null = 'asc'
  
  if (currentDirection === 'asc') {
    nextDirection = 'desc'
  } else if (currentDirection === 'desc') {
    nextDirection = null
  }

  // ソート設定更新
  localConfig.value = {
    ...localConfig.value,
    direction: nextDirection
  }

  // データソート実行
  const sortedData = performSort()
  
  // イベント発火
  emit('sort-changed', sortedData, localConfig.value)
  emit('update:data', sortedData)
  emit('update:config', localConfig.value)
}

// ソート実行
const performSort = () => {
  if (localConfig.value.direction === null) {
    return [...props.data] // 元の順序に戻す
  }

  const sorted = [...props.data].sort((a, b) => {
    const aValue = getNestedValue(a, localConfig.value.key)
    const bValue = getNestedValue(b, localConfig.value.key)
    
    const result = compareValues(aValue, bValue, localConfig.value.type)
    
    return localConfig.value.direction === 'asc' ? result : -result
  })

  return sorted
}

// 値の比較
const compareValues = (a: any, b: any, type: string = 'text'): number => {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1

  switch (type) {
    case 'number':
      return Number(a) - Number(b)
    case 'date':
      return new Date(a).getTime() - new Date(b).getTime()
    case 'boolean':
      return Number(b) - Number(a) // true が先に来る
    default:
      return String(a).localeCompare(String(b))
  }
}

// ネストしたオブジェクトから値を取得
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((o, p) => o?.[p], obj)
}
</script>

<style scoped>
.base-sort-component {
  @apply inline-flex;
}

.sort-trigger[disabled] {
  @apply opacity-50 cursor-not-allowed;
}
</style>