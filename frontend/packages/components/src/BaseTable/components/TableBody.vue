<!--
  @fileoverview TableBody Component  
  @description テーブルボディ（データ行の表示）
-->

<template>
  <tbody class="table-body" :class="bodyClasses">
    <template v-for="(item, index) in displayData" :key="getRowKey(item)">
      <!-- Main Data Row -->
      <tr 
        :class="getRowClasses(item, index)"
        @click="handleRowClick(item, $event)"
        @dblclick="handleRowDoubleClick(item, $event)"
        @contextmenu="handleRowContextMenu(item, $event)"
        :aria-selected="isSelected(item)"
        :data-row-id="item.id"
      >
        <!-- Selection Cell -->
        <td v-if="selectable" class="body-cell cell--selection">
          <input
            type="checkbox"
            :checked="isSelected(item)"
            @change="handleItemSelect(item, $event)"
            @click.stop
            :aria-label="`行 ${index + 1} を選択`"
          />
        </td>

        <!-- Data Cells -->
        <MultiItemCell
          v-for="column in visibleColumns"
          :key="`${item.id}-${column.id}`"
          :items="column.items"
          :data="item"
          :column="column"
          :row-index="index"
          :editable="editable"
          :compact="compact"
          :actions="getRowActions(item)"
          @edit-start="handleEditStart"
          @edit-save="handleEditSave"
          @edit-cancel="handleEditCancel"
          @value-click="handleValueClick"
          @action-click="handleActionClick"
          @expand-toggle="handleExpandToggle"
        />

        <!-- Actions Cell -->
        <td v-if="hasRowActions" class="body-cell cell--actions">
          <div class="row-actions">
            <button
              v-for="action in rowActions"
              :key="action.key"
              type="button"
              :class="getActionButtonClasses(action)"
              @click.stop="handleActionClick(action.key, item)"
              :disabled="action.disabled?.(item)"
              :title="action.label"
              :aria-label="`${action.label}: ${item.id}`"
            >
              <span v-if="action.icon">{{ action.icon }}</span>
              <span v-else>{{ action.label }}</span>
            </button>
          </div>
        </td>
      </tr>

      <!-- Expanded Detail Row -->
      <tr 
        v-if="expandedItems.has(item.id) && expandableContent"
        :key="`${item.id}-expanded`"
        class="expanded-row"
      >
        <td :colspan="totalCellCount" class="expanded-cell">
          <div class="expanded-content">
            <slot name="expanded-content" :item="item" :index="index">
              <div class="default-expanded-content">
                <pre>{{ JSON.stringify(item, null, 2) }}</pre>
              </div>
            </slot>
          </div>
        </td>
      </tr>
    </template>

    <!-- Empty State -->
    <tr v-if="displayData.length === 0" class="empty-row">
      <td :colspan="totalCellCount" class="empty-cell">
        <div class="empty-state">
          <slot name="empty-state">
            <div class="default-empty-state">
              <div class="empty-icon">📄</div>
              <h3 class="empty-title">データがありません</h3>
              <p class="empty-description">
                {{ searchQuery ? '検索条件に一致するデータがありません。' : '表示するデータがありません。' }}
              </p>
            </div>
          </slot>
        </div>
      </td>
    </tr>

    <!-- Loading State -->
    <tr v-if="loading" class="loading-row">
      <td :colspan="totalCellCount" class="loading-cell">
        <div class="loading-state">
          <div class="loading-spinner">⏳</div>
          <span class="loading-text">読み込み中...</span>
        </div>
      </td>
    </tr>
  </tbody>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn, TableItem, TableItemField } from '../types'
import MultiItemCell from './MultiItemCell.vue'

export interface RowAction {
  key: string
  label: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: (item: TableItem) => boolean
  handler: (item: TableItem) => void
}

export interface Props {
  displayData: TableItem[]
  visibleColumns: TableColumn[]
  selectedItems: Set<string | number>
  expandedItems: Set<string | number>
  selectable?: boolean
  editable?: boolean
  compact?: boolean
  loading?: boolean
  hasRowActions?: boolean
  expandableContent?: boolean
  rowActions?: RowAction[]
  searchQuery?: string
  clickAction?: 'none' | 'select' | 'expand' | 'custom'
  doubleClickAction?: 'none' | 'edit' | 'expand' | 'custom'
  getRowKey?: (item: TableItem) => string | number
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false,
  editable: false,
  compact: false,
  loading: false,
  hasRowActions: false,
  expandableContent: false,
  rowActions: () => [],
  searchQuery: '',
  clickAction: 'none',
  doubleClickAction: 'none',
  getRowKey: (item: TableItem) => item.id
})

const emit = defineEmits<{
  'item-select': [item: TableItem, selected: boolean]
  'edit-start': [id: string | number, field: string]
  'edit-save': [id: string | number, field: string, value: any]
  'edit-cancel': [id: string | number, field: string]
  'value-click': [item: TableItemField, data: TableItem]
  'action-click': [action: string, item: TableItem]
  'row-click': [item: TableItem, event: MouseEvent]
  'row-double-click': [item: TableItem, event: MouseEvent]
  'row-context-menu': [item: TableItem, event: MouseEvent]
  'expand-toggle': [item: TableItem, expanded: boolean]
}>()

const bodyClasses = computed(() => [
  {
    'body--compact': props.compact,
    'body--loading': props.loading,
    'body--empty': props.displayData.length === 0
  }
])

const totalCellCount = computed(() => {
  let count = props.visibleColumns.length
  if (props.selectable) count++
  if (props.hasRowActions) count++
  return count
})

const isSelected = (item: TableItem): boolean => {
  return props.selectedItems.has(item.id)
}

const isExpanded = (item: TableItem): boolean => {
  return props.expandedItems.has(item.id)
}

const getRowClasses = (item: TableItem, index: number) => [
  'body-row',
  `row-${index}`,
  {
    'row--selected': isSelected(item),
    'row--expanded': isExpanded(item),
    'row--even': index % 2 === 0,
    'row--odd': index % 2 === 1,
    'row--clickable': props.clickAction !== 'none',
    'row--editable': props.editable
  }
]

const getRowActions = (item: TableItem) => {
  return props.rowActions.map(action => ({
    key: action.key,
    label: action.label,
    icon: action.icon,
    disabled: action.disabled?.(item) || false,
    handler: () => action.handler(item)
  }))
}

const getActionButtonClasses = (action: RowAction) => [
  'action-btn',
  `action-btn--${action.variant || 'secondary'}`,
  {
    'action-btn--icon-only': action.icon && !action.label
  }
]

const handleItemSelect = (item: TableItem, event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  emit('item-select', item, checked)
}

const handleEditStart = (id: string | number, field: string) => {
  emit('edit-start', id, field)
}

const handleEditSave = (id: string | number, field: string, value: any) => {
  emit('edit-save', id, field, value)
}

const handleEditCancel = (id: string | number, field: string) => {
  emit('edit-cancel', id, field)
}

const handleValueClick = (item: TableItemField, data: TableItem) => {
  emit('value-click', item, data)
}

const handleActionClick = (action: string, item: TableItem) => {
  emit('action-click', action, item)
}

const handleExpandToggle = (expanded: boolean, item: TableItem) => {
  emit('expand-toggle', item, expanded)
}

const handleRowClick = (item: TableItem, event: MouseEvent) => {
  switch (props.clickAction) {
    case 'select':
      if (props.selectable) {
        const isCurrentlySelected = isSelected(item)
        emit('item-select', item, !isCurrentlySelected)
      }
      break
    case 'expand':
      if (props.expandableContent) {
        const isCurrentlyExpanded = isExpanded(item)
        emit('expand-toggle', item, !isCurrentlyExpanded)
      }
      break
    case 'custom':
      emit('row-click', item, event)
      break
  }
}

const handleRowDoubleClick = (item: TableItem, event: MouseEvent) => {
  switch (props.doubleClickAction) {
    case 'edit':
      // Start editing first editable field
      const editableColumn = props.visibleColumns.find(col => 
        col.items.some(item => item.editable)
      )
      if (editableColumn) {
        const editableItem = editableColumn.items.find(item => item.editable)
        if (editableItem) {
          emit('edit-start', item.id, editableItem.key)
        }
      }
      break
    case 'expand':
      if (props.expandableContent) {
        const isCurrentlyExpanded = isExpanded(item)
        emit('expand-toggle', item, !isCurrentlyExpanded)
      }
      break
    case 'custom':
      emit('row-double-click', item, event)
      break
  }
}

const handleRowContextMenu = (item: TableItem, event: MouseEvent) => {
  emit('row-context-menu', item, event)
}
</script>

<style scoped>
.table-body {
  background-color: white;
}

.body-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.15s ease;
}

.body-row:hover {
  background-color: #f9fafb;
}

.row--selected {
  background-color: #eff6ff;
}

.row--selected:hover {
  background-color: #dbeafe;
}

.row--clickable {
  cursor: pointer;
}

.row--editable:hover {
  background-color: #fefce8;
}

.body-cell {
  padding: 8px 12px;
  border-right: 1px solid #f3f4f6;
  vertical-align: top;
}

.cell--selection {
  text-align: center;
  padding: 8px;
  width: 40px;
}

.cell--actions {
  text-align: center;
  width: 80px;
}

.row-actions {
  display: flex;
  gap: 4px;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.body-row:hover .row-actions {
  opacity: 1;
}

.action-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.action-btn--primary {
  background-color: #3b82f6;
  color: white;
}

.action-btn--primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.action-btn--secondary {
  background-color: #f3f4f6;
  color: #6b7280;
}

.action-btn--secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
  color: #374151;
}

.action-btn--danger {
  background-color: #fef2f2;
  color: #dc2626;
}

.action-btn--danger:hover:not(:disabled) {
  background-color: #fee2e2;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.expanded-row {
  background-color: #f8fafc;
}

.expanded-cell {
  padding: 0;
  border-bottom: 1px solid #e5e7eb;
}

.expanded-content {
  padding: 16px 24px;
  border-left: 3px solid #3b82f6;
  background-color: #f8fafc;
}

.default-expanded-content {
  font-family: monospace;
  font-size: 0.75rem;
  color: #374151;
  background-color: white;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  overflow-x: auto;
}

.empty-row {
  background-color: #fafafa;
}

.empty-cell {
  padding: 48px 24px;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.default-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.empty-description {
  margin: 0;
  font-size: 0.875rem;
  max-width: 400px;
  line-height: 1.4;
}

.loading-row {
  background-color: #fafafa;
}

.loading-cell {
  padding: 32px 24px;
  text-align: center;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6b7280;
}

.loading-spinner {
  font-size: 1.5rem;
  animation: pulse 2s infinite;
}

.loading-text {
  font-size: 0.875rem;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.body--compact .body-cell {
  padding: 4px 8px;
}

.body--compact .expanded-content {
  padding: 12px 16px;
}

@media (max-width: 768px) {
  .body-cell {
    padding: 6px 8px;
  }
  
  .row-actions {
    opacity: 1; /* Always show on mobile */
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
  }
}
</style>