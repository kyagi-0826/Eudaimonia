<!--
  @fileoverview BaseTableResponsive Component
  @description レスポンシブ対応のBaseTableのシンプルな統合デモ
-->

<template>
  <div class="base-table-responsive">
    <!-- ツールバー（共通） -->
    <div v-if="showToolbar" class="table-toolbar">
      <slot name="toolbar" :actions="toolbarActions">
        <div class="toolbar-content">
          <div class="toolbar-left">
            <h3 class="table-title">{{ title || 'データテーブル' }}</h3>
            <span class="item-count">{{ data.length }}件</span>
          </div>
          <div class="toolbar-right">
            <!-- 表示モード切り替え -->
            <div v-if="!isMobile && allowModeSwitch" class="view-mode-toggle">
              <button
                type="button"
                :class="['mode-btn', { active: viewMode === 'table' }]"
                @click="setViewMode('table')"
                title="テーブル表示"
              >
                📊
              </button>
              <button
                type="button"
                :class="['mode-btn', { active: viewMode === 'cards' }]"
                @click="setViewMode('cards')"
                title="カード表示"
              >
                🎴
              </button>
            </div>
            <slot name="toolbar-actions" />
          </div>
        </div>
      </slot>
    </div>

    <!-- レスポンシブ表示の分岐 -->
    <div class="table-content">
      <!-- モバイル表示：常にカード/スタック -->
      <template v-if="isMobile">
        <TableStack
          v-if="mobileDisplayMode === 'stack'"
          :data="data"
          :columns="visibleColumns"
          :hidden-columns="hiddenColumns"
          :selectable="selectable"
          :selected-items="selectedItems"
          :loading="loading"
          :show-header="false"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
          @item-swipe="handleItemSwipe"
        >
          <template #row-actions="slotProps">
            <slot name="mobile-actions" v-bind="slotProps" />
          </template>
          <template #empty>
            <slot name="empty">
              <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-message">データがありません</div>
              </div>
            </slot>
          </template>
        </TableStack>

        <TableCards
          v-else
          :data="data"
          :columns="visibleColumns"
          :hidden-columns="hiddenColumns"
          :selectable="selectable"
          :selected-items="selectedItems"
          :loading="loading"
          :show-header="false"
          :card-size="'medium'"
          @card-click="handleRowClick"
          @selection-change="handleSelectionChange"
          @item-swipe="handleItemSwipe"
        >
          <template #card-actions="slotProps">
            <slot name="mobile-actions" v-bind="slotProps" />
          </template>
          <template #empty>
            <slot name="empty">
              <div class="empty-state">
                <div class="empty-icon">🎴</div>
                <div class="empty-message">データがありません</div>
              </div>
            </slot>
          </template>
        </TableCards>
      </template>

      <!-- デスクトップ表示：テーブルまたはカード -->
      <template v-else-if="viewMode === 'cards'">
        <TableCards
          :data="data"
          :columns="visibleColumns"
          :hidden-columns="hiddenColumns"
          :selectable="selectable"
          :selected-items="selectedItems"
          :loading="loading"
          :show-header="false"
          :card-size="'large'"
          @card-click="handleRowClick"
          @selection-change="handleSelectionChange"
          @item-swipe="handleItemSwipe"
        >
          <template #card-actions="slotProps">
            <slot name="card-actions" v-bind="slotProps" />
          </template>
          <template #empty>
            <slot name="empty">
              <div class="empty-state">
                <div class="empty-icon">🎴</div>
                <div class="empty-message">データがありません</div>
              </div>
            </slot>
          </template>
        </TableCards>
      </template>

      <!-- デスクトップ表示：通常のテーブル -->
      <template v-else>
        <div class="table-wrapper">
          <table class="base-table">
            <!-- ヘッダー -->
            <thead class="table-header">
              <tr>
                <th v-if="selectable" class="select-column">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    :indeterminate="isIndeterminate"
                    @change="toggleSelectAll"
                  />
                </th>
                <th
                  v-for="column in visibleColumns"
                  :key="column.id"
                  :class="getHeaderClasses(column)"
                  :style="getColumnStyle(column)"
                  @click="handleSort(column)"
                >
                  <!-- 仮: 複数項目名を表示 -->
                  <div class="column-items">
                    <div v-for="item in column.items" :key="item.key" class="item-header-simple">
                      <span class="item-name">{{ item.label }}</span>
                      <span 
                        v-if="item.sortable" 
                        class="sort-icon" 
                        @click.stop="handleItemSort(column, item)"
                        :title="`${item.label}でソート`"
                      >
                        {{ getSortIcon(column, item) }}
                      </span>
                      <span 
                        v-if="item.filterable" 
                        class="filter-icon"
                        @click.stop="handleItemFilter(column, item)"
                        :title="`${item.label}でフィルター`"
                      >🔍</span>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>

            <!-- ボディ -->
            <tbody class="table-body">
              <tr
                v-for="(item, index) in data"
                :key="getItemKey(item, index)"
                :class="getRowClasses(item, index)"
                @click="handleRowClick(item, index, $event)"
              >
                <td v-if="selectable" class="select-cell">
                  <input
                    type="checkbox"
                    :checked="isSelected(item)"
                    @change="toggleSelection(item)"
                    @click.stop
                  />
                </td>
                <td
                  v-for="column in visibleColumns"
                  :key="column.id"
                  :class="getCellClasses(column)"
                  :style="getColumnStyle(column)"
                >
                  <MultiItemCell
                    :items="column.items"
                    :data="item"
                    :column="column"
                    :row-index="index"
                    :compact="false"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 空の状態 -->
          <div v-if="data.length === 0 && !loading" class="table-empty">
            <slot name="empty">
              <div class="empty-state">
                <div class="empty-icon">📊</div>
                <div class="empty-message">データがありません</div>
              </div>
            </slot>
          </div>

          <!-- ローディング -->
          <div v-if="loading" class="table-loading">
            <div class="loading-spinner"></div>
            <div class="loading-message">読み込み中...</div>
          </div>
        </div>
      </template>
    </div>

    <!-- ページネーション（共通） -->
    <div v-if="showPagination" class="table-pagination">
      <slot name="pagination">
        <div class="pagination-info">
          {{ data.length }}件中 1-{{ data.length }}件を表示
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTableResponsive } from '../composables/useTableResponsive'
import type { TableColumn, TableItem, TableItemField, SortConfig } from '../types'
import MultiItemCell from './MultiItemCell.vue'
import MultiItemHeader from './MultiItemHeader.vue'
import TableStack from './TableStack.vue'
import TableCards from './TableCards.vue'

export interface Props {
  data: TableItem[]
  columns: TableColumn[]
  title?: string
  selectable?: boolean
  selectedItems?: TableItem[]
  loading?: boolean
  showToolbar?: boolean
  showPagination?: boolean
  allowModeSwitch?: boolean
  itemKey?: string | ((item: TableItem) => string)
  responsiveBreakpoint?: number
  mobileDisplayMode?: 'stack' | 'cards'
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false,
  selectedItems: () => [],
  loading: false,
  showToolbar: true,
  showPagination: false,
  allowModeSwitch: true,
  itemKey: 'id',
  responsiveBreakpoint: 768,
  mobileDisplayMode: 'stack'
})

const emit = defineEmits<{
  'row-click': [item: TableItem, index: number, event: MouseEvent]
  'selection-change': [selectedItems: TableItem[]]
  'sort-change': [column: TableColumn, direction: 'asc' | 'desc' | null, item?: any]
  'filter-dialog-open': [column: TableColumn, item: any]
  'item-swipe': [item: TableItem, direction: 'left' | 'right']
}>()

// =============================================================================
// 📱 Responsive Logic
// =============================================================================

const {
  isMobile,
  visibleColumns,
  hiddenColumns,
  currentBreakpoint
} = useTableResponsive(props.columns)

// =============================================================================
// 🎯 Reactive State
// =============================================================================

const viewMode = ref<'table' | 'cards'>('table')
const sortColumn = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

// ソート設定状態
const sortConfig = ref<SortConfig[]>([])

// =============================================================================
// 🎯 Event Handlers
// =============================================================================

const handleItemSort = (column: TableColumn, item: TableItemField) => {
  // 現在のソート状態を確認
  const existingSort = sortConfig.value.find(sort => sort.key === item.key)
  
  if (existingSort) {
    // 既存のソートがある場合：昇順 → 降順 → 解除
    if (existingSort.direction === 'asc') {
      existingSort.direction = 'desc'
    } else if (existingSort.direction === 'desc') {
      // ソート解除
      sortConfig.value = sortConfig.value.filter(sort => sort.key !== item.key)
    }
  } else {
    // 新しいソートを追加（昇順から開始）
    sortConfig.value.push({
      key: item.key,
      direction: 'asc',
      label: item.label,
      type: 'text' // 一時的に固定
    })
  }
  
  // イベントを親に通知
  const currentSort = sortConfig.value.find(sort => sort.key === item.key)
  emit('sort-change', column, currentSort?.direction || null, item)
}

const handleItemFilter = (column: TableColumn, item: TableItemField) => {
  // フィルター設定ダイアログを開く
  emit('filter-dialog-open', column, item)
}

// =============================================================================
// 💻 Computed Properties
// =============================================================================

const toolbarActions = computed(() => ({
  refresh: () => console.log('refresh'),
  export: () => console.log('export'),
  configure: () => console.log('configure')
}))

const isAllSelected = computed(() => {
  return props.selectable && 
         props.selectedItems.length > 0 && 
         props.selectedItems.length === props.data.length
})

const isIndeterminate = computed(() => {
  return props.selectable && 
         props.selectedItems.length > 0 && 
         props.selectedItems.length < props.data.length
})

// =============================================================================
// 🎯 Methods
// =============================================================================

const hasColumnSortable = (column: TableColumn): boolean => {
  return column.items.some(item => item.sortable === true)
}

const getColumnDataType = (column: TableColumn): string => {
  const numericTypes = column.items.filter(item => item.type === 'number')
  return numericTypes.length > 0 ? 'number' : 'text'
}

const getItemKey = (item: TableItem, index: number): string => {
  if (typeof props.itemKey === 'function') {
    return props.itemKey(item)
  }
  return String(item[props.itemKey] || index)
}

const isSelected = (item: TableItem): boolean => {
  return props.selectedItems.some(selected => 
    getItemKey(selected, 0) === getItemKey(item, 0)
  )
}

const getHeaderClasses = (column: TableColumn) => [
  'table-th',
  {
    'sortable': hasColumnSortable(column),
    'sorted': sortColumn.value === column.id,
    'sorted-asc': sortColumn.value === column.id && sortDirection.value === 'asc',
    'sorted-desc': sortColumn.value === column.id && sortDirection.value === 'desc'
  }
]

const getRowClasses = (item: TableItem, index: number) => [
  'table-row',
  {
    'selected': isSelected(item),
    'even': index % 2 === 0,
    'odd': index % 2 === 1
  }
]

const getCellClasses = (column: TableColumn) => [
  'table-cell',
  `cell-${column.id}`,
  {
    'cell-numeric': getColumnDataType(column) === 'number',
    'cell-text': getColumnDataType(column) === 'text'
  }
]

const getColumnStyle = (column: TableColumn) => {
  const style: any = {}
  
  if (column.width) {
    if (column.width.type === 'fixed') {
      style.width = `${column.width.value}px`
      style.minWidth = `${column.width.value}px`
      style.maxWidth = `${column.width.value}px`
    } else if (column.width.type === 'percentage') {
      style.width = `${column.width.value}%`
    }
  }
  
  return style
}

const getSortIcon = (column: TableColumn, item: TableItemField): string => {
  // 現在のソート状態を確認
  const currentSort = sortConfig.value.find(sort => sort.key === item.key)
  
  if (!currentSort) return '📊' // 未ソート
  
  return currentSort.direction === 'asc' ? '🔼' : '🔽'
}

// =============================================================================
// 🎯 Event Handlers
// =============================================================================

const handleRowClick = (item: TableItem, index: number, event: MouseEvent) => {
  emit('row-click', item, index, event)
}

const handleSelectionChange = (selectedItems: TableItem[]) => {
  emit('selection-change', selectedItems)
}

const toggleSelection = (item: TableItem) => {
  if (!props.selectable) return
  
  const key = getItemKey(item, 0)
  let newSelection: TableItem[]
  
  if (isSelected(item)) {
    newSelection = props.selectedItems.filter(selected => 
      getItemKey(selected, 0) !== key
    )
  } else {
    newSelection = [...props.selectedItems, item]
  }
  
  emit('selection-change', newSelection)
}

const toggleSelectAll = () => {
  if (!props.selectable) return
  
  const newSelection = isAllSelected.value ? [] : [...props.data]
  emit('selection-change', newSelection)
}

const handleSort = (column: TableColumn) => {
  if (!hasColumnSortable(column)) return
  
  let newDirection: 'asc' | 'desc' | null = 'asc'
  
  if (sortColumn.value === column.id) {
    newDirection = sortDirection.value === 'asc' ? 'desc' : 
                   sortDirection.value === 'desc' ? null : 'asc'
  }
  
  sortColumn.value = newDirection ? column.id : null
  sortDirection.value = newDirection
  
  emit('sort-change', column, newDirection, null)
}

const handleItemSwipe = (item: TableItem, direction: 'left' | 'right') => {
  emit('item-swipe', item, direction)
}

const setViewMode = (mode: 'table' | 'cards') => {
  viewMode.value = mode
}
</script>

<style scoped>
/* =============================================================================
   📱 Container & Layout
   ============================================================================= */

.base-table-responsive {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f8fafc;
}

/* Multi-item header styling */
.column-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
}

.item-header-simple {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.item-name {
  font-weight: 500;
  color: #374151;
}

.sort-icon, .filter-icon {
  font-size: 0.75rem;
  cursor: pointer;
  opacity: 0.7;
  padding: 0.2rem;
  border-radius: 0.25rem;
}

/* =============================================================================
   🔧 Toolbar
   ============================================================================= */

.table-toolbar {
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.table-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.item-count {
  font-size: 0.875rem;
  color: #64748b;
  padding: 4px 8px;
  background-color: #f1f5f9;
  border-radius: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-mode-toggle {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
}

.mode-btn {
  padding: 8px 12px;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-btn:first-child {
  border-radius: 6px 0 0 6px;
}

.mode-btn:last-child {
  border-radius: 0 6px 6px 0;
}

.mode-btn:hover {
  background-color: #f1f5f9;
}

.mode-btn.active {
  background-color: #3b82f6;
  color: white;
}

/* =============================================================================
   📊 Table Content
   ============================================================================= */

.table-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.table-wrapper {
  height: 100%;
  overflow: auto;
  background-color: white;
}

.base-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.table-header {
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table-th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-right: 1px solid #e2e8f0;
  user-select: none;
}

.table-th:last-child {
  border-right: none;
}

.table-th.sortable {
  cursor: default;
}

.select-column {
  width: 48px;
  padding: 12px 16px;
}

.sort-indicator {
  margin-left: 8px;
  font-size: 0.75rem;
}

.table-body {
  background-color: white;
}

.table-row {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
}

.table-row:hover {
  background-color: #f8fafc;
}

.table-row.selected {
  background-color: #eff6ff;
}

.table-cell {
  padding: 12px 16px;
  border-right: 1px solid #f1f5f9;
  vertical-align: top;
}

.table-cell:last-child {
  border-right: none;
}

.select-cell {
  width: 48px;
  text-align: center;
}

.cell-numeric {
  text-align: right;
}

/* =============================================================================
   🚫 Empty & Loading States
   ============================================================================= */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-message {
  font-size: 1.125rem;
  font-weight: 500;
}

.table-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-message {
  font-size: 1rem;
  font-weight: 500;
  color: #64748b;
}

/* =============================================================================
   📄 Pagination
   ============================================================================= */

.table-pagination {
  background-color: white;
  border-top: 1px solid #e2e8f0;
  padding: 16px 24px;
}

.pagination-info {
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}

/* =============================================================================
   🎬 Animations
   ============================================================================= */

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* =============================================================================
   📱 Mobile Responsive
   ============================================================================= */

@media (max-width: 768px) {
  .table-toolbar {
    padding: 12px 16px;
  }
  
  .toolbar-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }
  
  .view-mode-toggle {
    display: none; /* モバイルでは表示モード切り替えを隠す */
  }
}

/* =============================================================================
   🌙 Dark Mode Support
   ============================================================================= */

@media (prefers-color-scheme: dark) {
  .base-table-responsive {
    background-color: #0f172a;
  }
  
  .table-toolbar,
  .table-wrapper,
  .table-pagination {
    background-color: #1e293b;
    border-color: #334155;
  }
  
  .table-title {
    color: #f1f5f9;
  }
  
  .item-count {
    background-color: #334155;
    color: #cbd5e1;
  }
  
  .table-header {
    background-color: #0f172a;
    border-color: #334155;
  }
  
  .table-th {
    color: #cbd5e1;
    border-color: #334155;
  }
  
  .table-row {
    border-color: #334155;
  }
  
  .table-row:hover {
    background-color: #0f172a;
  }
  
  .table-row.selected {
    background-color: #1e3a8a;
  }
  
  .table-cell {
    border-color: #334155;
    color: #cbd5e1;
  }
  
  .mode-btn {
    color: #cbd5e1;
    border-color: #334155;
  }
  
  .mode-btn:hover {
    background-color: #334155;
  }
  
  .view-mode-toggle {
    border-color: #475569;
  }
  
  .loading-message {
    color: #cbd5e1;
  }
  
  .pagination-info {
    color: #94a3b8;
  }
}
</style>