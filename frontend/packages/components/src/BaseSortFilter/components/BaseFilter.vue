<template>
  <div class="base-filter-component">
    <FilterButton
      :size="size"
      :active="hasActiveFilters"
      :count="activeFilterCount"
      :disabled="disabled"
      @click="openDialog"
    />
    
    <FilterDialog
      v-if="showDialog"
      :config="localConfig"
      :options="availableOptions"
      @update:config="updateConfig"
      @close="closeDialog"
      @apply="applyFilter"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FilterProps, FilterConfig, FilterEmits } from '../types'
import FilterButton from './FilterButton.vue'
import FilterDialog from './FilterDialog.vue'

// Props
const props = withDefaults(defineProps<FilterProps>(), {
  disabled: false,
  size: 'medium',
  theme: 'light'
})

// Emits
const emit = defineEmits<FilterEmits>()

// リアクティブデータ
const showDialog = ref(false)
const localData = ref([...props.data])
const localConfig = ref<FilterConfig>({ ...props.config })

// 計算プロパティ
const hasActiveFilters = computed(() => 
  localConfig.value.enabled && localConfig.value.value !== null && localConfig.value.value !== ''
)

const activeFilterCount = computed(() => {
  return hasActiveFilters.value ? 1 : 0
})

// フィルタオプション（selectタイプ用）
const availableOptions = computed(() => {
  if (localConfig.value.type !== 'select') return []
  
  const uniqueValues = [...new Set(
    props.data.map(item => getNestedValue(item, localConfig.value.key))
  )].filter(value => value !== null && value !== undefined)
  
  return uniqueValues.sort()
})

// ダイアログ操作
const openDialog = () => {
  if (props.disabled) return
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
}

// 設定更新
const updateConfig = (newConfig: FilterConfig) => {
  localConfig.value = { ...newConfig }
}

// フィルタ適用
const applyFilter = () => {
  const filteredData = performFilter()
  
  emit('filter-changed', filteredData, localConfig.value)
  emit('update:data', filteredData) 
  emit('update:config', localConfig.value)
  
  closeDialog()
}

// フィルタ実行
const performFilter = () => {
  if (!localConfig.value.enabled || localConfig.value.value === null || localConfig.value.value === '') {
    return [...props.data] // 元データをそのまま返す
  }

  return props.data.filter(item => {
    const itemValue = getNestedValue(item, localConfig.value.key)
    return matchesFilter(itemValue, localConfig.value.value, localConfig.value.operator, localConfig.value.type)
  })
}

// フィルタ条件チェック
const matchesFilter = (itemValue: any, filterValue: any, operator: string, type: string): boolean => {
  if (itemValue === null || itemValue === undefined) return false

  switch (operator) {
    case 'equals':
      return String(itemValue).toLowerCase() === String(filterValue).toLowerCase()
    
    case 'contains':
      return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase())
    
    case 'startsWith':
      return String(itemValue).toLowerCase().startsWith(String(filterValue).toLowerCase())
    
    case 'endsWith':
      return String(itemValue).toLowerCase().endsWith(String(filterValue).toLowerCase())
    
    case 'greaterThan':
      if (type === 'number') return Number(itemValue) > Number(filterValue)
      if (type === 'date') return new Date(itemValue) > new Date(filterValue)
      return String(itemValue) > String(filterValue)
    
    case 'lessThan':
      if (type === 'number') return Number(itemValue) < Number(filterValue)
      if (type === 'date') return new Date(itemValue) < new Date(filterValue)
      return String(itemValue) < String(filterValue)
    
    case 'between':
      if (!Array.isArray(filterValue) || filterValue.length !== 2) return false
      const [min, max] = filterValue
      if (type === 'number') {
        const numValue = Number(itemValue)
        return numValue >= Number(min) && numValue <= Number(max)
      }
      if (type === 'date') {
        const dateValue = new Date(itemValue)
        return dateValue >= new Date(min) && dateValue <= new Date(max)
      }
      return false
    
    case 'in':
      if (!Array.isArray(filterValue)) return false
      return filterValue.includes(itemValue)
    
    default:
      return false
  }
}

// ネストしたオブジェクトから値を取得
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((o, p) => o?.[p], obj)
}
</script>

<style scoped>
.base-filter-component {
  @apply relative inline-flex;
}
</style>