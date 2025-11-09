<template>
  <div class="base-sort-filter">
    <div class="controls-container" :class="containerClasses">
      <!-- ソートコントロール -->
      <div v-if="config.sorts.length > 0" class="sort-controls">
        <BaseSort
          v-for="(sortConfig, index) in config.sorts"
          :key="`sort-${sortConfig.key}-${index}`"
          :data="currentData"
          :config="sortConfig"
          :size="size"
          :disabled="disabled"
          @sort-changed="handleSortChanged(index, $event[0], $event[1])"
        />
      </div>

      <!-- フィルタコントロール -->
      <div v-if="config.filters.length > 0" class="filter-controls">
        <BaseFilter
          v-for="(filterConfig, index) in config.filters"
          :key="`filter-${filterConfig.key}-${index}`"
          :data="originalData"
          :config="filterConfig"
          :size="size"
          :disabled="disabled"
          @filter-changed="handleFilterChanged(index, $event[0], $event[1])"
        />
      </div>

      <!-- クリアボタン -->
      <button
        v-if="hasActiveFiltersOrSorts && showClearButton"
        @click="clearAll"
        class="clear-button"
        :class="[
          'px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800',
          'border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
        ]"
        :disabled="disabled"
      >
        クリア
      </button>
    </div>

    <!-- アクティブな条件表示 -->
    <div v-if="showActiveConditions && hasActiveFiltersOrSorts" class="active-conditions mt-3">
      <div class="text-xs text-gray-500 mb-2">アクティブな条件:</div>
      <div class="flex flex-wrap gap-2">
        <!-- アクティブソート -->
        <span
          v-for="(sort, index) in activeSorts"
          :key="`active-sort-${index}`"
          class="condition-tag sort-tag"
        >
          {{ sort.label || sort.key }}
          <span class="ml-1">{{ sort.direction === 'asc' ? '↑' : '↓' }}</span>
          <button 
            @click="clearSort(index)"
            class="ml-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </span>

        <!-- アクティブフィルタ -->
        <span
          v-for="(filter, index) in activeFilters"
          :key="`active-filter-${index}`"
          class="condition-tag filter-tag"
        >
          {{ filter.label || filter.key }}: {{ formatFilterValue(filter) }}
          <button 
            @click="clearFilter(index)"
            class="ml-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { SortFilterProps, SortFilterConfig, SortFilterEmits } from '../types'
import BaseSort from './BaseSort.vue'
import BaseFilter from './BaseFilter.vue'

// 拡張Props型定義
interface ExtendedSortFilterProps extends SortFilterProps {
  showClearButton?: boolean
  showActiveConditions?: boolean
}

// Props
const props = withDefaults(defineProps<ExtendedSortFilterProps>(), {
  disabled: false,
  size: 'medium',
  theme: 'light',
  showClearButton: true,
  showActiveConditions: true
})

// Emits
const emit = defineEmits<SortFilterEmits>()

// リアクティブデータ
const originalData = ref([...props.data])
const currentData = ref([...props.data])
const localConfig = ref<SortFilterConfig>({ ...props.config })

// 計算プロパティ
const containerClasses = computed(() => [
  'flex items-center gap-3 flex-wrap',
  {
    'opacity-50': props.disabled
  }
])

const activeSorts = computed(() => 
  localConfig.value.sorts.filter(sort => sort.direction !== null)
)

const activeFilters = computed(() => 
  localConfig.value.filters.filter(filter => 
    filter.enabled && filter.value !== null && filter.value !== ''
  )
)

const hasActiveFiltersOrSorts = computed(() => 
  activeSorts.value.length > 0 || activeFilters.value.length > 0
)

// データ処理
const processData = () => {
  let processedData = [...originalData.value]

  // フィルタ適用
  if (activeFilters.value.length > 0) {
    processedData = applyFilters(processedData)
  }

  // ソート適用
  if (activeSorts.value.length > 0) {
    processedData = applySorts(processedData)
  }

  currentData.value = processedData
  
  emit('data-changed', processedData, localConfig.value)
  emit('update:data', processedData)
  emit('update:config', localConfig.value)
}

// フィルタ適用
const applyFilters = (data: any[]) => {
  if (localConfig.value.filterLogic === 'OR') {
    return data.filter(item => 
      activeFilters.value.some(filter => matchesFilter(item, filter))
    )
  } else {
    return data.filter(item => 
      activeFilters.value.every(filter => matchesFilter(item, filter))
    )
  }
}

// ソート適用
const applySorts = (data: any[]) => {
  if (!localConfig.value.multiSort) {
    const firstSort = activeSorts.value[0]
    if (!firstSort) return data
    
    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, firstSort.key)
      const bValue = getNestedValue(b, firstSort.key)
      const result = compareValues(aValue, bValue, firstSort.type)
      return firstSort.direction === 'asc' ? result : -result
    })
  }

  // 複数ソート
  return [...data].sort((a, b) => {
    for (const sort of activeSorts.value) {
      const aValue = getNestedValue(a, sort.key)
      const bValue = getNestedValue(b, sort.key)
      const result = compareValues(aValue, bValue, sort.type)
      const sortedResult = sort.direction === 'asc' ? result : -result
      
      if (sortedResult !== 0) return sortedResult
    }
    return 0
  })
}

// イベントハンドラ
const handleSortChanged = (index: number, data: any[], sortConfig: any) => {
  localConfig.value.sorts[index] = sortConfig
  processData()
}

const handleFilterChanged = (index: number, data: any[], filterConfig: any) => {
  localConfig.value.filters[index] = filterConfig
  processData()
}

// クリア操作
const clearAll = () => {
  localConfig.value.sorts.forEach(sort => sort.direction = null)
  localConfig.value.filters.forEach(filter => {
    filter.enabled = false
    filter.value = null
  })
  processData()
}

const clearSort = (index: number) => {
  localConfig.value.sorts[index].direction = null
  processData()
}

const clearFilter = (index: number) => {
  localConfig.value.filters[index].enabled = false
  localConfig.value.filters[index].value = null
  processData()
}

// ユーティリティ関数
const matchesFilter = (item: any, filter: any): boolean => {
  const itemValue = getNestedValue(item, filter.key)
  return matchesFilterValue(itemValue, filter.value, filter.operator, filter.type)
}

const matchesFilterValue = (itemValue: any, filterValue: any, operator: string, type: string): boolean => {
  if (itemValue === null || itemValue === undefined) return false

  switch (operator) {
    case 'equals':
      return String(itemValue).toLowerCase() === String(filterValue).toLowerCase()
    case 'contains':
      return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase())
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
      return false
    case 'in':
      return Array.isArray(filterValue) && filterValue.includes(itemValue)
    default:
      return false
  }
}

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
      return Number(b) - Number(a)
    default:
      return String(a).localeCompare(String(b))
  }
}

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((o, p) => o?.[p], obj)
}

const formatFilterValue = (filter: any): string => {
  if (Array.isArray(filter.value)) {
    return filter.value.join(', ')
  }
  return String(filter.value)
}

// データ変更を監視
watch(() => props.data, (newData) => {
  originalData.value = [...newData]
  processData()
}, { immediate: true })
</script>

<style scoped>
.condition-tag {
  @apply inline-flex items-center px-2 py-1 rounded-md text-xs font-medium;
}

.sort-tag {
  @apply bg-blue-100 text-blue-800 border border-blue-200;
}

.filter-tag {
  @apply bg-green-100 text-green-800 border border-green-200;
}

.clear-button[disabled] {
  @apply opacity-50 cursor-not-allowed;
}
</style>