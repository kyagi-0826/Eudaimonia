<!--
  @fileoverview ColumnConfig Component
  @description カラム表示設定コンポーネント（表示/非表示、順序変更、幅調整）
-->

<template>
  <div class="column-config" :class="configClasses">
    <!-- Header -->
    <div class="config-header">
      <h3 class="config-title">カラム設定</h3>
      <div class="config-actions">
        <button
          type="button"
          class="action-btn action-btn--reset"
          @click="resetToDefaults"
          :disabled="!hasChanges"
          title="デフォルト設定に戻す"
        >
          リセット
        </button>
        <button
          type="button"
          class="action-btn action-btn--close"
          @click="$emit('close')"
          title="閉じる"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button
        type="button"
        class="quick-btn"
        @click="toggleAllColumns(true)"
        :disabled="allColumnsVisible"
      >
        全て表示
      </button>
      <button
        type="button"
        class="quick-btn"
        @click="toggleAllColumns(false)"
        :disabled="noColumnsVisible"
      >
        全て非表示
      </button>
      <button
        type="button"
        class="quick-btn"
        @click="autoSizeColumns"
        :disabled="!hasVisibleColumns"
      >
        自動調整
      </button>
    </div>

    <!-- Search -->
    <div v-if="searchable" class="column-search">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="カラムを検索..."
        :aria-label="'カラム検索'"
      />
      <span v-if="filteredColumns.length !== totalColumns" class="search-results">
        {{ filteredColumns.length }}/{{ totalColumns }}件
      </span>
    </div>

    <!-- Column List -->
    <div class="column-list" ref="columnListRef">
      <div
        v-for="(column, index) in filteredColumns"
        :key="column.id"
        :class="getColumnItemClasses(column)"
        :draggable="reorderable && !column.sticky"
        @dragstart="handleDragStart($event, column, index)"
        @dragend="handleDragEnd"
        @dragover.prevent
        @drop="handleDrop($event, index)"
      >
        <!-- Drag Handle -->
        <div
          v-if="reorderable && !column.sticky"
          class="drag-handle"
          title="ドラッグして並び替え"
        >
          ⋮⋮
        </div>

        <!-- Visibility Toggle -->
        <label class="visibility-toggle">
          <input
            type="checkbox"
            :checked="column.visible"
            @change="toggleColumnVisibility(column.id)"
            :disabled="isColumnRequired(column)"
            class="visibility-checkbox"
          />
          <span class="checkbox-custom"></span>
        </label>

        <!-- Column Info -->
        <div class="column-info">
          <div class="column-header">
            <span class="column-title">{{ column.label }}</span>
            <div class="column-badges">
              <span v-if="isColumnRequired(column)" class="badge badge--required">必須</span>
              <span v-if="column.sticky" class="badge badge--fixed">固定</span>
              <span v-if="column.items.some(item => item.sortable)" class="badge badge--sortable">並替</span>
            </div>
          </div>
          <div v-if="column.tooltip" class="column-description">
            {{ column.tooltip }}
          </div>
        </div>

        <!-- Width Control -->
        <div v-if="resizable" class="width-control">
          <label class="width-label">幅:</label>
          <div class="width-input-group">
            <input
              v-model.number="column.width.value"
              type="number"
              :min="column.minWidth || 50"
              :max="column.maxWidth || 500"
              class="width-input"
              @change="updateColumnWidth(column.id, column.width?.value || 150)"
            />
            <span class="width-unit">px</span>
          </div>
          <div class="width-presets">
            <button
              v-for="preset in widthPresets"
              :key="preset.value"
              type="button"
              class="preset-btn"
              @click="updateColumnWidth(column.id, preset.value)"
              :title="preset.label"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <!-- Column Stats -->
        <div v-if="showStats && (column as any).stats" class="column-stats">
          <div class="stats-item">
            <span class="stats-label">データ数:</span>
            <span class="stats-value">{{ (column as any).stats.count }}</span>
          </div>
          <div v-if="(column as any).stats.unique" class="stats-item">
            <span class="stats-label">ユニーク:</span>
            <span class="stats-value">{{ (column as any).stats.unique }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredColumns.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-message">
          {{ searchQuery ? '検索結果がありません' : 'カラムがありません' }}
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="config-footer">
      <button
        type="button"
        class="footer-btn footer-btn--secondary"
        @click="$emit('cancel')"
      >
        キャンセル
      </button>
      <button
        type="button"
        class="footer-btn footer-btn--primary"
        @click="applyChanges"
        :disabled="!hasChanges"
      >
        適用
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { TableColumn, ColumnConfigOptions, ColumnStats } from '../types'

export interface Props {
  columns: TableColumn[]
  options?: ColumnConfigOptions
  searchable?: boolean
  reorderable?: boolean
  resizable?: boolean
  showStats?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  searchable: true,
  reorderable: true,
  resizable: true,
  showStats: false,
  loading: false
})

const emit = defineEmits<{
  'update:columns': [columns: TableColumn[]]
  'close': []
  'cancel': []
  'reset': []
}>()

// =============================================================================
// 📊 Reactive State
// =============================================================================

const searchQuery = ref('')
const draggedColumn = ref<TableColumn | null>(null)
const draggedIndex = ref(-1)
const columnListRef = ref<HTMLElement>()

// Local copy of columns for editing
const localColumns = ref<TableColumn[]>([...props.columns])

// Width presets
const widthPresets = [
  { label: 'XS', value: 60 },
  { label: 'S', value: 100 },
  { label: 'M', value: 150 },
  { label: 'L', value: 200 },
  { label: 'XL', value: 300 }
]

// =============================================================================
// 📊 Computed Properties
// =============================================================================

const configClasses = computed(() => [
  'column-config',
  {
    'config--loading': props.loading,
    'config--no-reorder': !props.reorderable,
    'config--no-resize': !props.resizable
  }
])

const filteredColumns = computed(() => {
  if (!searchQuery.value) {
    return localColumns.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return localColumns.value.filter(column =>
    column.label.toLowerCase().includes(query) ||
    column.id.toLowerCase().includes(query) ||
    (column.tooltip && column.tooltip.toLowerCase().includes(query))
  )
})

const totalColumns = computed(() => localColumns.value.length)

// Check if column is required (has any required items)
const isColumnRequired = (column: TableColumn): boolean => {
  return column.items.some(item => item.required)
}

const allColumnsVisible = computed(() =>
  localColumns.value.every(col => col.visible || isColumnRequired(col))
)

const noColumnsVisible = computed(() =>
  localColumns.value.every(col => !col.visible && !isColumnRequired(col))
)

const hasVisibleColumns = computed(() =>
  localColumns.value.some(col => col.visible)
)

const hasChanges = computed(() => {
  if (localColumns.value.length !== props.columns.length) {
    return true
  }
  
  return localColumns.value.some((col, index) => {
    const original = props.columns[index]
    return original &&
      (col.visible !== original.visible ||
       col.width?.value !== original.width?.value ||
       col.id !== original.id)
  })
})

// =============================================================================
// 🎯 Event Handlers & Methods
// =============================================================================

const getColumnItemClasses = (column: TableColumn) => [
  'column-item',
  {
    'column-item--visible': column.visible,
    'column-item--required': isColumnRequired(column),
    'column-item--fixed': column.sticky,
    'column-item--dragging': draggedColumn.value?.id === column.id
  }
]

const toggleColumnVisibility = (id: string) => {
  const column = localColumns.value.find(col => col.id === id)
  if (column && !isColumnRequired(column)) {
    column.visible = !column.visible
  }
}

const toggleAllColumns = (visible: boolean) => {
  localColumns.value.forEach(column => {
    if (!isColumnRequired(column) || visible) {
      column.visible = visible
    }
  })
}

const updateColumnWidth = (id: string, width: number) => {
  const column = localColumns.value.find(col => col.id === id)
  if (column && column.width) {
    column.width = {
      ...column.width,
      type: 'fixed',
      value: Math.max(
        column.minWidth || 50,
        Math.min(column.maxWidth || 500, width)
      )
    }
  }
}

const autoSizeColumns = () => {
  const visibleColumns = localColumns.value.filter(col => col.visible)
  const availableWidth = 1200 // Assume default table width
  const fixedWidth = visibleColumns
    .filter(col => col.sticky)
    .reduce((sum, col) => sum + (col.width?.value || 150), 0)
  
  const flexibleColumns = visibleColumns.filter(col => !col.sticky)
  const flexWidth = Math.floor(
    (availableWidth - fixedWidth) / flexibleColumns.length
  )
  
  flexibleColumns.forEach(column => {
    if (column.width) {
      column.width = {
        ...column.width,
        type: 'fixed',
        value: Math.max(
          column.minWidth || 50,
          Math.min(column.maxWidth || 500, flexWidth)
        )
      }
    }
  })
}

const resetToDefaults = () => {
  localColumns.value = [...props.columns]
  emit('reset')
}

const applyChanges = () => {
  emit('update:columns', [...localColumns.value])
}

// =============================================================================
// 🖱️ Drag & Drop Handlers
// =============================================================================

const handleDragStart = (event: DragEvent, column: TableColumn, index: number) => {
  if (!props.reorderable || column.sticky) return
  
  draggedColumn.value = column
  draggedIndex.value = index
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', column.id)
  }
  
  // Add visual feedback
  setTimeout(() => {
    if (event.target instanceof HTMLElement) {
      event.target.classList.add('dragging')
    }
  }, 0)
}

const handleDragEnd = (event: DragEvent) => {
  if (event.target instanceof HTMLElement) {
    event.target.classList.remove('dragging')
  }
  
  draggedColumn.value = null
  draggedIndex.value = -1
}

const handleDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault()
  
  if (!draggedColumn.value || draggedIndex.value === -1) return
  
  const sourceIndex = draggedIndex.value
  if (sourceIndex === targetIndex) return
  
  // Create new array with reordered columns
  const newColumns = [...localColumns.value]
  const [removed] = newColumns.splice(sourceIndex, 1)
  newColumns.splice(targetIndex, 0, removed)
  
  localColumns.value = newColumns
}

// =============================================================================
// 🔄 Watchers
// =============================================================================

watch(
  () => props.columns,
  (newColumns) => {
    if (!hasChanges.value) {
      localColumns.value = [...newColumns]
    }
  },
  { deep: true }
)

// Auto-scroll to show search results
watch(
  () => filteredColumns.value.length,
  async () => {
    await nextTick()
    if (columnListRef.value && searchQuery.value) {
      columnListRef.value.scrollTop = 0
    }
  }
)
</script>

<style scoped>
/* =============================================================================
   🎨 Column Config Layout
   ============================================================================= */

.column-config {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.config--loading {
  opacity: 0.6;
  pointer-events: none;
}

/* =============================================================================
   📑 Header
   ============================================================================= */

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.config-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.config-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover:not(:disabled) {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn--reset {
  color: #dc2626;
  border-color: #fca5a5;
}

.action-btn--reset:hover:not(:disabled) {
  background-color: #fef2f2;
  border-color: #f87171;
}

.action-btn--close {
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 1.25rem;
  font-weight: bold;
}

/* =============================================================================
   ⚡ Quick Actions
   ============================================================================= */

.quick-actions {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
}

.quick-btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  color: #374151;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.quick-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
  background-color: #f8fafc;
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* =============================================================================
   🔍 Search
   ============================================================================= */

.column-search {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #374151;
  transition: border-color 0.15s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.search-results {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

/* =============================================================================
   📋 Column List
   ============================================================================= */

.column-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.column-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.15s ease;
  cursor: default;
}

.column-item:hover {
  background-color: #f9fafb;
}

.column-item--visible {
  background-color: #f0f9ff;
}

.column-item--required {
  background-color: #fef3c7;
}

.column-item--dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

/* Drag Handle */
.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #9ca3af;
  cursor: grab;
  font-size: 0.875rem;
  transition: color 0.15s ease;
}

.drag-handle:hover {
  color: #6b7280;
}

.drag-handle:active {
  cursor: grabbing;
}

/* Visibility Toggle */
.visibility-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.visibility-checkbox {
  display: none;
}

.checkbox-custom {
  display: block;
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  background-color: white;
  position: relative;
  transition: all 0.15s ease;
}

.visibility-checkbox:checked + .checkbox-custom {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.visibility-checkbox:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.visibility-checkbox:disabled + .checkbox-custom {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Column Info */
.column-info {
  flex: 1;
  min-width: 0;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.column-title {
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.column-badges {
  display: flex;
  gap: 4px;
}

.badge {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge--required {
  background-color: #fee2e2;
  color: #dc2626;
}

.badge--fixed {
  background-color: #e5e7eb;
  color: #6b7280;
}

.badge--sortable {
  background-color: #dbeafe;
  color: #2563eb;
}

.column-description {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
}

/* =============================================================================
   📐 Width Control
   ============================================================================= */

.width-control {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;
}

.width-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.width-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.width-input {
  width: 60px;
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  font-size: 0.75rem;
  text-align: center;
  transition: border-color 0.15s ease;
}

.width-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.width-unit {
  font-size: 0.75rem;
  color: #9ca3af;
}

.width-presets {
  display: flex;
  gap: 2px;
}

.preset-btn {
  padding: 2px 6px;
  border: 1px solid #e5e7eb;
  border-radius: 2px;
  background-color: white;
  color: #6b7280;
  font-size: 0.625rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background-color: #f8fafc;
}

/* =============================================================================
   📊 Column Stats
   ============================================================================= */

.column-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.625rem;
  color: #9ca3af;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.stats-label {
  font-weight: 500;
}

.stats-value {
  font-weight: 600;
  color: #6b7280;
}

/* =============================================================================
   🚫 Empty State
   ============================================================================= */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.empty-message {
  font-size: 0.875rem;
  font-weight: 500;
}

/* =============================================================================
   🦶 Footer
   ============================================================================= */

.config-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.footer-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.footer-btn--secondary {
  border: 1px solid #d1d5db;
  background-color: white;
  color: #374151;
}

.footer-btn--secondary:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.footer-btn--primary {
  border: 1px solid #3b82f6;
  background-color: #3b82f6;
  color: white;
}

.footer-btn--primary:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.footer-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* =============================================================================
   📱 Responsive Design
   ============================================================================= */

@media (max-width: 768px) {
  .column-config {
    border-radius: 0;
    height: 100vh;
  }
  
  .config-header {
    padding: 12px 16px;
  }
  
  .quick-actions,
  .column-search {
    padding: 12px 16px;
  }
  
  .column-item {
    padding: 12px 16px;
    flex-wrap: wrap;
  }
  
  .width-control {
    width: 100%;
    margin-top: 8px;
  }
  
  .config-footer {
    padding: 12px 16px;
  }
}

/* =============================================================================
   🌙 Dark Mode
   ============================================================================= */

@media (prefers-color-scheme: dark) {
  .column-config {
    background-color: #1f2937;
    color: #f9fafb;
  }
  
  .config-header,
  .config-footer {
    background-color: #111827;
    border-color: #374151;
  }
  
  .config-title {
    color: #f9fafb;
  }
  
  .quick-actions,
  .column-search {
    background-color: #1f2937;
    border-color: #374151;
  }
  
  .column-item {
    border-color: #374151;
  }
  
  .column-item:hover {
    background-color: #374151;
  }
  
  .column-item--visible {
    background-color: #1e3a8a;
  }
  
  .action-btn,
  .quick-btn,
  .preset-btn {
    background-color: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
  
  .search-input,
  .width-input {
    background-color: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
  
  .checkbox-custom {
    background-color: #374151;
    border-color: #4b5563;
  }
}
</style>