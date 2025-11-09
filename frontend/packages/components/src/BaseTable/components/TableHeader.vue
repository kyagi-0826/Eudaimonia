<!--
  @fileoverview TableHeader Component
  @description テーブルヘッダー（カラムヘッダー、ソート・フィルタ統合）
-->

<template>
  <thead class="table-header" :class="headerClasses">
    <tr class="header-row">
      <!-- Selection Column -->
      <th 
        v-if="selectable"
        class="header-cell header-cell--selection"
        :style="{ width: '40px' }"
      >
        <input
          type="checkbox"
          :checked="isAllSelected"
          :indeterminate="isPartiallySelected"
          @change="handleSelectAll"
          :aria-label="selectAllAriaLabel"
        />
      </th>

      <!-- Data Columns -->
      <th
        v-for="column in visibleColumns"
        :key="column.id"
        :class="getColumnHeaderClasses(column)"
        :style="getColumnHeaderStyles(column)"
        @click="handleColumnClick(column)"
        :role="column.resizable ? 'columnheader' : undefined"
        :aria-sort="getAriaSortValue(column)"
      >
        <div class="header-cell-content">
          <!-- Column Label -->
          <div class="column-label">
            <span class="label-text" :title="column.tooltip">{{ column.label }}</span>
            <span v-if="hasRequiredItems(column)" class="required-indicator">*</span>
          </div>

          <!-- Sort/Filter for multi-item columns -->
          <div v-if="column.items.length > 0" class="column-items">
            <div
              v-for="item in column.items"
              :key="item.key"
              class="item-controls"
              :class="getItemControlsClasses(item)"
            >
              <span class="item-label">{{ item.label }}</span>
              <div class="item-actions">
                <button
                  v-if="item.sortable"
                  type="button"
                  class="item-sort-btn"
                  :class="getSortButtonClasses(item)"
                  @click.stop="handleSort(item)"
                  :aria-label="`${item.label}でソート`"
                  :title="getSortTitle(item)"
                >
                  {{ getSortIcon(item) }}
                </button>
                <button
                  v-if="item.filterable"
                  type="button"
                  class="item-filter-btn"
                  :class="getFilterButtonClasses(item)"
                  @click.stop="handleFilter(item)"
                  :aria-label="`${item.label}でフィルタ`"
                  :title="getFilterTitle(item)"
                >
                  🔍
                </button>
              </div>
            </div>
          </div>

          <!-- Resize Handle -->
          <div
            v-if="column.resizable"
            class="resize-handle"
            @mousedown="startResize($event, column)"
            @touchstart="startResize($event, column)"
          />
        </div>
      </th>

      <!-- Actions Column -->
      <th 
        v-if="hasRowActions"
        class="header-cell header-cell--actions"
        :style="{ width: '80px' }"
      >
        <span class="actions-label">操作</span>
      </th>
    </tr>
  </thead>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn, TableItemField, SortConfig } from '../types'

export interface Props {
  columns: TableColumn[]
  visibleColumns: TableColumn[]
  selectable?: boolean
  isAllSelected?: boolean
  isPartiallySelected?: boolean
  hasRowActions?: boolean
  sortConfig?: Record<string, SortConfig>
  theme?: 'light' | 'dark'
  sticky?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false,
  isAllSelected: false,
  isPartiallySelected: false,
  hasRowActions: false,
  theme: 'light',
  sticky: false
})

const emit = defineEmits<{
  'select-all': [checked: boolean]
  'sort-changed': [item: TableItemField, direction: 'asc' | 'desc' | null]
  'filter-clicked': [item: TableItemField]
  'column-resize': [column: TableColumn, width: number]
}>()

const headerClasses = computed(() => [
  `header--${props.theme}`,
  {
    'header--sticky': props.sticky
  }
])

const selectAllAriaLabel = computed(() => 
  props.isAllSelected ? 'すべて選択解除' : 'すべて選択'
)

const getColumnHeaderClasses = (column: TableColumn) => [
  'header-cell',
  'header-cell--data',
  `header-cell--${column.id}`,
  {
    'header-cell--sortable': column.items.some(item => item.sortable),
    'header-cell--filterable': column.items.some(item => item.filterable),
    'header-cell--resizable': column.resizable,
    'header-cell--sticky': column.sticky
  }
]

const getColumnHeaderStyles = (column: TableColumn) => {
  const styles: Record<string, any> = {}
  
  if (column.width) {
    const { width } = column
    switch (width.type) {
      case 'fixed':
        styles.width = `${width.value}px`
        styles.minWidth = styles.width
        styles.maxWidth = styles.width
        break
      case 'percentage':
        styles.width = `${width.value}%`
        break
      case 'minmax':
        styles.minWidth = `${width.min}px`
        styles.maxWidth = `${width.max}px`
        break
    }
  }
  
  if (column.sticky === 'left') {
    styles.position = 'sticky'
    styles.left = '0'
    styles.zIndex = '10'
  } else if (column.sticky === 'right') {
    styles.position = 'sticky'
    styles.right = '0'
    styles.zIndex = '10'
  }
  
  return styles
}

const hasRequiredItems = (column: TableColumn): boolean => {
  return column.items.some(item => item.required)
}

const getItemControlsClasses = (item: TableItemField) => [
  `item-controls--${item.type}`,
  {
    'item-controls--required': item.required,
    'item-controls--high-priority': item.priority === 'high'
  }
]

const getCurrentSort = (item: TableItemField) => {
  return props.sortConfig?.[item.key]
}

const getSortButtonClasses = (item: TableItemField) => {
  const sort = getCurrentSort(item)
  return [
    'sort-btn',
    {
      'sort-btn--active': sort?.direction,
      [`sort-btn--${sort?.direction}`]: sort?.direction
    }
  ]
}

const getFilterButtonClasses = (item: TableItemField) => [
  'filter-btn',
  {
    'filter-btn--active': false // TODO: Add filter state logic
  }
]

const getSortIcon = (item: TableItemField): string => {
  const sort = getCurrentSort(item)
  if (sort?.direction === 'asc') return '▲'
  if (sort?.direction === 'desc') return '▼'
  return '↕'
}

const getSortTitle = (item: TableItemField): string => {
  const sort = getCurrentSort(item)
  if (sort?.direction === 'asc') return '降順でソート'
  if (sort?.direction === 'desc') return 'ソートをクリア'
  return '昇順でソート'
}

const getFilterTitle = (item: TableItemField): string => {
  return `${item.label}でフィルタ`
}

const getAriaSortValue = (column: TableColumn) => {
  const sortableItems = column.items.filter(item => item.sortable)
  if (sortableItems.length === 0) return undefined
  
  // If any item has sort applied
  const hasSort = sortableItems.some(item => getCurrentSort(item)?.direction)
  if (!hasSort) return 'none'
  
  // Check if all sortable items have same direction
  const directions = sortableItems
    .map(item => getCurrentSort(item)?.direction)
    .filter(Boolean)
  
  if (directions.length === 1) {
    return directions[0] === 'asc' ? 'ascending' : 'descending'
  }
  
  return 'other'
}

const handleSelectAll = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  emit('select-all', checked)
}

const handleColumnClick = (column: TableColumn) => {
  // If column has only one sortable item, trigger sort
  const sortableItems = column.items.filter(item => item.sortable)
  if (sortableItems.length === 1) {
    handleSort(sortableItems[0])
  }
}

const handleSort = (item: TableItemField) => {
  const currentSort = getCurrentSort(item)
  let newDirection: 'asc' | 'desc' | null = 'asc'
  
  if (currentSort?.direction === 'asc') {
    newDirection = 'desc'
  } else if (currentSort?.direction === 'desc') {
    newDirection = null
  }
  
  emit('sort-changed', item, newDirection)
}

const handleFilter = (item: TableItemField) => {
  emit('filter-clicked', item)
}

const startResize = (event: MouseEvent | TouchEvent, column: TableColumn) => {
  // TODO: Implement column resizing logic
  console.log('Start resize:', column.id)
}
</script>

<style scoped>
.table-header {
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.header--dark {
  background-color: #1f2937;
  border-bottom-color: #374151;
  color: #f9fafb;
}

.header--sticky {
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-row {
  height: 48px;
}

.header-cell {
  position: relative;
  padding: 8px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  border-right: 1px solid #e5e7eb;
  user-select: none;
}

.header--dark .header-cell {
  color: #d1d5db;
  border-right-color: #374151;
}

.header-cell--selection {
  text-align: center;
  padding: 8px;
}

.header-cell--actions {
  text-align: center;
}

.header-cell--sortable {
  cursor: pointer;
}

.header-cell--sortable:hover {
  background-color: #f3f4f6;
}

.header--dark .header-cell--sortable:hover {
  background-color: #374151;
}

.header-cell-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  height: 100%;
}

.column-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.label-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.required-indicator {
  color: #ef4444;
  font-size: 0.75rem;
}

.column-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 2px 4px;
  border-radius: 3px;
  background-color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  min-height: 20px;
}

.header--dark .item-controls {
  background-color: rgba(0, 0, 0, 0.2);
}

.item-controls--high-priority {
  background-color: #dbeafe;
  font-weight: 500;
}

.header--dark .item-controls--high-priority {
  background-color: rgba(59, 130, 246, 0.2);
}

.item-label {
  flex: 1;
  color: #6b7280;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header--dark .item-label {
  color: #9ca3af;
}

.item-actions {
  display: flex;
  gap: 2px;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.item-controls:hover .item-actions {
  opacity: 1;
}

.item-sort-btn,
.item-filter-btn {
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  transition: all 0.15s ease;
  color: #6b7280;
}

.header--dark .item-sort-btn,
.header--dark .item-filter-btn {
  color: #9ca3af;
}

.item-sort-btn:hover,
.item-filter-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #374151;
}

.header--dark .item-sort-btn:hover,
.header--dark .item-filter-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #f3f4f6;
}

.sort-btn--active {
  background-color: #3b82f6 !important;
  color: white !important;
}

.filter-btn--active {
  background-color: #059669 !important;
  color: white !important;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  border-right: 2px solid transparent;
  transition: border-color 0.15s ease;
}

.resize-handle:hover {
  border-right-color: #3b82f6;
}

.actions-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.header--dark .actions-label {
  color: #9ca3af;
}

@media (max-width: 768px) {
  .header-cell {
    padding: 6px 8px;
    font-size: 0.75rem;
  }
  
  .item-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  
  .item-actions {
    align-self: flex-end;
  }
}
</style>