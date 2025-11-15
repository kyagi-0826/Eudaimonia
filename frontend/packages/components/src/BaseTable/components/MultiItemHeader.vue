<!--
  @fileoverview MultiItemHeader Component
  @description 複数項目ヘッダー表示コンポーネント
  🎯 仕様要件: 各項目名とインライン操作アイコン（🔍📊）を並列表示
-->

<template>
  <th 
    :class="headerClasses"
    :style="headerStyles"
    role="columnheader"
    :aria-label="column.label"
  >
    <div class="multi-item-header">
      <!-- Primary Item Header -->
      <div 
        v-if="primaryItem"
        class="item-header primary-item-header"
      >
        <span class="item-label">{{ primaryItem.label }}</span>
        <div class="item-actions">
          <button
            v-if="primaryItem.sortable"
            type="button"
            class="item-action sort-action"
            :class="getSortActionClasses(primaryItem)"
            @click="handleSort(primaryItem)"
            :aria-label="`${primaryItem.label}でソート`"
            :title="getSortTitle(primaryItem)"
          >
            <span class="sort-icon">{{ getSortIcon(primaryItem) }}</span>
          </button>
          <button
            v-if="primaryItem.filterable"
            type="button"
            class="item-action filter-action"
            :class="getFilterActionClasses(primaryItem)"
            @click="handleFilter(primaryItem)"
            :aria-label="`${primaryItem.label}でフィルター`"
            :title="`${primaryItem.label}でフィルター`"
          >
            <span class="filter-icon">🔍</span>
          </button>
        </div>
      </div>

      <!-- Secondary Items Headers -->
      <div 
        v-for="(item, index) in secondaryItems"
        :key="`secondary-${item.key}-${index}`"
        class="item-header secondary-item-header"
      >
        <span class="item-label">{{ item.label }}</span>
        <div class="item-actions">
          <button
            v-if="item.sortable"
            type="button"
            class="item-action sort-action"
            :class="getSortActionClasses(item)"
            @click="handleSort(item)"
            :aria-label="`${item.label}でソート`"
            :title="getSortTitle(item)"
          >
            <span class="sort-icon">{{ getSortIcon(item) }}</span>
          </button>
          <button
            v-if="item.filterable"
            type="button"
            class="item-action filter-action"
            :class="getFilterActionClasses(item)"
            @click="handleFilter(item)"
            :aria-label="`${item.label}でフィルター`"
            :title="`${item.label}でフィルター`"
          >
            <span class="filter-icon">🔍</span>
          </button>
        </div>
      </div>

      <!-- Additional Items Headers (if expanded) -->
      <div 
        v-if="showAdditionalHeaders && additionalItems.length > 0"
        class="additional-headers"
      >
        <div 
          v-for="(item, index) in additionalItems"
          :key="`additional-${item.key}-${index}`"
          class="item-header additional-item-header"
        >
          <span class="item-label">{{ item.label }}</span>
          <div class="item-actions">
            <button
              v-if="item.sortable"
              type="button"
              class="item-action sort-action"
              :class="getSortActionClasses(item)"
              @click="handleSort(item)"
              :aria-label="`${item.label}でソート`"
              :title="getSortTitle(item)"
            >
              <span class="sort-icon">{{ getSortIcon(item) }}</span>
            </button>
            <button
              v-if="item.filterable"
              type="button"
              class="item-action filter-action"
              :class="getFilterActionClasses(item)"
              @click="handleFilter(item)"
              :aria-label="`${item.label}でフィルター`"
              :title="`${item.label}でフィルター`"
            >
              <span class="filter-icon">🔍</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </th>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn, TableItemField, SortConfig } from '../types'

// =============================================================================
// 🔧 Props & Emits
// =============================================================================

interface Props {
  column: TableColumn
  sortConfig?: SortConfig[]
  showAdditionalHeaders?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sortConfig: () => [],
  showAdditionalHeaders: false
})

const emit = defineEmits<{
  'sort-click': [item: TableItemField, column: TableColumn]
  'filter-click': [item: TableItemField, column: TableColumn]
}>()

// =============================================================================
// 📊 Computed Properties
// =============================================================================

// Item categorization (項目の分類)
const primaryItem = computed((): TableItemField | null => {
  return props.column.items.find(item => item.priority === 'high') || props.column.items[0] || null
})

const secondaryItems = computed((): TableItemField[] => {
  const primary = primaryItem.value
  if (!primary) return props.column.items

  return props.column.items
    .filter(item => item !== primary && item.priority !== 'low')
    .slice(0, 2) // 最大2個まで
})

const additionalItems = computed((): TableItemField[] => {
  const primary = primaryItem.value
  const secondary = secondaryItems.value
  const used = [primary, ...secondary].filter(Boolean)
  
  return props.column.items.filter(item => !used.includes(item))
})

// Header styling
const headerClasses = computed(() => [
  'multi-item-header-cell',
  {
    'multi-item-header-cell--resizable': props.column.resizable,
    'multi-item-header-cell--sortable': props.column.items.some(item => item.sortable),
    'multi-item-header-cell--filterable': props.column.items.some(item => item.filterable)
  }
])

const headerStyles = computed(() => {
  const styles: Record<string, any> = {}
  
  if (props.column.width) {
    const { width } = props.column
    if (width.type === 'fixed' && width.value) {
      styles.width = `${width.value}px`
      styles.minWidth = `${width.value}px`
    } else if (width.type === 'percentage' && width.value) {
      styles.width = `${width.value}%`
    } else if (width.type === 'minmax') {
      styles.minWidth = width.min ? `${width.min}px` : 'auto'
      styles.maxWidth = width.max ? `${width.max}px` : 'none'
    }
  }
  
  return styles
})

// =============================================================================
// 🎯 Sort & Filter Logic
// =============================================================================

const getCurrentSort = (item: TableItemField) => {
  return props.sortConfig?.find(sort => sort.key === item.key)
}

const getSortIcon = (item: TableItemField) => {
  const sort = getCurrentSort(item)
  if (!sort || !sort.direction) return '📊'
  return sort.direction === 'asc' ? '🔼' : '🔽'
}

const getSortTitle = (item: TableItemField) => {
  const sort = getCurrentSort(item)
  if (!sort || !sort.direction) return `${item.label}で昇順ソート`
  return sort.direction === 'asc' 
    ? `${item.label}で降順ソート` 
    : `${item.label}でソート解除`
}

const getSortActionClasses = (item: TableItemField) => {
  const sort = getCurrentSort(item)
  return {
    'sort-action--active': sort && sort.direction,
    'sort-action--asc': sort?.direction === 'asc',
    'sort-action--desc': sort?.direction === 'desc'
  }
}

const getFilterActionClasses = (item: TableItemField) => {
  // TODO: フィルター状態を管理する仕組みができたら実装
  return {
    'filter-action--active': false // placeholder
  }
}

// =============================================================================
// 🎯 Event Handlers
// =============================================================================

const handleSort = (item: TableItemField) => {
  emit('sort-click', item, props.column)
}

const handleFilter = (item: TableItemField) => {
  emit('filter-click', item, props.column)
}
</script>

<style scoped>
/* =============================================================================
   📋 Multi Item Header Styles
   ============================================================================= */

.multi-item-header {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.75rem 0.5rem;
  min-height: fit-content;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 1.75rem;
}

.item-header:last-child {
  border-bottom: none;
}

.primary-item-header {
  font-weight: 600;
  color: #111827;
}

.secondary-item-header {
  font-weight: 500;
  color: #374151;
}

.additional-item-header {
  font-weight: 400;
  color: #6b7280;
  font-size: 0.875rem;
}

.item-label {
  flex: 1;
  text-align: left;
  font-size: 0.875rem;
  line-height: 1.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.item-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: transparent;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.75rem;
}

.item-action:hover {
  background-color: #f3f4f6;
}

.item-action:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

/* Sort action states */
.sort-action {
  color: #6b7280;
}

.sort-action:hover {
  color: #374151;
}

.sort-action--active {
  color: #3b82f6;
  background-color: #eff6ff;
}

.sort-action--active:hover {
  background-color: #dbeafe;
}

/* Filter action states */
.filter-action {
  color: #6b7280;
}

.filter-action:hover {
  color: #374151;
}

.filter-action--active {
  color: #059669;
  background-color: #ecfdf5;
}

.filter-action--active:hover {
  background-color: #d1fae5;
}

/* Header cell states */
.multi-item-header-cell {
  position: relative;
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  vertical-align: top;
}

.multi-item-header-cell--resizable {
  resize: horizontal;
  overflow: auto;
}

/* Additional headers */
.additional-headers {
  padding-top: 0.375rem;
  border-top: 1px dashed #d1d5db;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .multi-item-header {
    padding: 0.5rem 0.25rem;
    gap: 0.25rem;
  }

  .item-header {
    min-height: 1.5rem;
  }

  .item-label {
    font-size: 0.8rem;
  }

  .item-action {
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.7rem;
  }

  .additional-item-header .item-label {
    font-size: 0.75rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .multi-item-header-cell {
    background-color: #1f2937;
    border-color: #374151;
  }

  .primary-item-header {
    color: #f9fafb;
  }

  .secondary-item-header {
    color: #e5e7eb;
  }

  .additional-item-header {
    color: #9ca3af;
  }

  .item-header {
    border-color: #374151;
  }

  .item-action:hover {
    background-color: #374151;
  }

  .sort-action--active {
    background-color: #1e3a8a;
  }

  .filter-action--active {
    background-color: #064e3b;
  }
}
</style>