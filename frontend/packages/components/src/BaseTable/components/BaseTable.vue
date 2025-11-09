<!--
  @fileoverview BaseTable Component
  @description 企業レベルのテーブルシステムの核心コンポーネント
  🔥 高機能テーブル：複数項目表示、動的設定、BaseSortFilter統合、レスポンシブ対応
-->

<template>
  <div
    :class="tableContainerClasses"
    :style="containerStyles"
    role="region"
    :aria-label="ariaLabel"
  >
    <!-- ツールバー -->
    <div v-if="showToolbar" class="table-toolbar">
      <slot name="toolbar" :actions="toolbarActions">
        <TableToolbar
          v-bind="toolbarProps"
          @export="handleExport"
          @refresh="handleRefresh"
          @configure="handleConfigure"
        />
      </slot>
    </div>

    <!-- レスポンシブ表示の切り替え -->
    <template v-if="isMobile">
      <!-- モバイル：スタック表示 -->
      <TableStack
        v-if="mobileDisplayMode === 'stack'"
        :data="displayData"
        :columns="visibleColumns"
        :hidden-columns="hiddenColumns"
        :selectable="config.selection?.enabled"
        :selected-items="selectedItems"
        :loading="loading"
        :card-size="'medium'"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        @item-swipe="handleItemSwipe"
      >
        <template #row-actions="slotProps">
          <slot name="mobile-actions" v-bind="slotProps" />
        </template>
        <template #empty>
          <slot name="empty" />
        </template>
      </TableStack>

      <!-- モバイル：カード表示 -->
      <TableCards
        v-else-if="mobileDisplayMode === 'cards'"
        :data="displayData"
        :columns="visibleColumns"
        :hidden-columns="hiddenColumns"
        :selectable="config.selection?.enabled"
        :selected-items="selectedItems"
        :loading="loading"
        :card-size="'medium'"
        @card-click="handleRowClick"
        @selection-change="handleSelectionChange"
        @item-swipe="handleItemSwipe"
      >
        <template #card-actions="slotProps">
          <slot name="mobile-actions" v-bind="slotProps" />
        </template>
        <template #empty>
          <slot name="empty" />
        </template>
      </TableCards>
    </template>

    <!-- デスクトップ：通常のテーブル表示 -->
    <template v-else>

    <!-- テーブル本体 -->
    <div 
      ref="tableWrapperRef"
      :class="tableWrapperClasses"
      :style="tableWrapperStyles"
    >
      <!-- BaseSortFilter統合 -->
      <BaseSortFilter
        v-if="sortFilterConfig"
        v-model:data="sortedFilteredData"
        v-model:config="sortFilterConfig"
        :disabled="loading"
        @data-changed="handleDataChanged"
        @config-changed="handleSortFilterConfigChanged"
      />

      <!-- テーブル要素 -->
      <table
        ref="tableRef"
        :class="tableClasses"
        role="table"
        :aria-rowcount="totalItems"
        :aria-colcount="visibleColumns.length"
      >
        <!-- テーブルヘッダー -->
        <TableHeader
          :columns="visibleColumns"
          :config="config"
          :sort-filter-config="sortFilterConfig"
          :loading="loading"
          @column-resize="handleColumnResize"
          @column-sort="handleColumnSort"
          @column-filter="handleColumnFilter"
        >
          <template #header-cell="slotProps">
            <slot name="header-cell" v-bind="slotProps" />
          </template>
        </TableHeader>

        <!-- テーブルボディ -->
        <TableBody
          :data="displayData"
          :columns="visibleColumns"
          :config="config"
          :selected-items="selectedItems"
          :expanded-items="expandedItems"
          :editing-items="editingItems"
          :loading="loading"
          @row-click="handleRowClick"
          @row-select="handleRowSelect"
          @row-expand="handleRowExpand"
          @cell-edit="handleCellEdit"
        >
          <template #row="slotProps">
            <slot name="row" v-bind="slotProps" />
          </template>
          
          <template #cell="slotProps">
            <slot name="cell" v-bind="slotProps">
              <MultiItemCell
                v-bind="slotProps"
                @edit-start="handleEditStart"
                @edit-save="handleEditSave"
                @edit-cancel="handleEditCancel"
              />
            </slot>
          </template>
          
          <template #empty>
            <slot name="empty">
              <div class="table-empty">
                <div class="empty-icon">📋</div>
                <div class="empty-text">{{ emptyText }}</div>
              </div>
            </slot>
          </template>
          
          <template #loading>
            <slot name="loading">
              <div class="table-loading">
                <div class="loading-spinner">⏳</div>
                <div class="loading-text">{{ loadingText }}</div>
              </div>
            </slot>
          </template>
        </TableBody>
      </table>
    </div>

    <!-- ページネーション -->
    <div v-if="showPagination" class="table-pagination">
      <slot name="pagination" :pagination="paginationControls">
        <TablePagination
          v-bind="paginationProps"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </slot>
    </div>

    <!-- 設定ダイアログ -->
    <Teleport to="body">
      <ColumnConfig
        v-if="showConfigDialog"
        :config="config"
        :columns="columns"
        @save="handleConfigSave"
        @cancel="handleConfigCancel"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  watch, 
  provide, 
  onMounted, 
  onUnmounted,
  nextTick,
  defineExpose
} from 'vue'
import type { 
  TableColumn, 
  TableItem, 
  TableConfig,
  TableSettings 
} from '../types'
import { useVirtualizer } from '../composables/useVirtualizer'
import { useTableResponsive } from '../composables/useTableResponsive'
import MultiItemCell from './MultiItemCell.vue'
import TableStack from './TableStack.vue'
import TableCards from './TableCards.vue'

export interface Props {

const props = withDefaults(defineProps<Props>(), {
  height: 'auto',
  maxHeight: 'none',
  stickyHeader: false,
  stickyFooter: false,
  showToolbar: true,
  showPagination: true,
  emptyText: 'データがありません',
  loadingText: '読み込み中...',
  errorText: 'エラーが発生しました',
  ariaLabel: 'データテーブル',
  rowKey: 'id'
})

const emit = defineEmits<TableEvents>()

// =============================================================================
// 🔄 Composables Setup
// =============================================================================

// Table Data Management
const {
  state: dataState,
  computed: dataComputed,
  actions: dataActions
} = useTableData(props.data, {
  transform: (data) => data,
  validateData: (data) => Array.isArray(data),
  enableUndo: true
})

// Table Configuration Management
const {
  config,
  columns,
  computed: configComputed,
  actions: configActions
} = useTableConfig(props.config, {
  persist: true,
  persistKey: 'base-table-default',
  responsive: true
})

// =============================================================================
// 📊 Reactive State
// =============================================================================

const tableRef = ref<HTMLTableElement>()
const tableWrapperRef = ref<HTMLDivElement>()
const showConfigDialog = ref(false)
const isConfiguring = ref(false)

// Sort & Filter state
const sortFilterConfig = ref<SortFilterConfig>()
const sortedFilteredData = ref<TableItem[]>([])

// Pagination state
const currentPage = ref(1)
const currentPageSize = ref(props.config.pagination.pageSize)

// =============================================================================
// 📊 Computed Properties
// =============================================================================

// Data computed
const {
  totalItems,
  hasData,
  isEmpty,
  selectedCount,
  selectedData,
  isAllSelected,
  isPartiallySelected
} = dataComputed

const {
  data,
  loading,
  error,
  selectedItems,
  expandedItems,
  editingItems
} = dataState

// Config computed
const {
  visibleColumns,
  columnCount,
  currentBreakpoint,
  responsiveColumns
} = configComputed

// Display data (after sorting, filtering, pagination)
const displayData = computed(() => {
  let result = sortedFilteredData.value || data.value

  // Apply pagination
  if (config.value.pagination.enabled) {
    const startIndex = (currentPage.value - 1) * currentPageSize.value
    const endIndex = startIndex + currentPageSize.value
    result = result.slice(startIndex, endIndex)
  }

  return result
})

// Style computed
const tableContainerClasses = computed(() => [
  'base-table-container',
  `base-table--${config.value.appearance.size}`,
  `base-table--${config.value.appearance.theme}`,
  `base-table--density-${config.value.appearance.density}`,
  {
    'base-table--bordered': config.value.appearance.bordered,
    'base-table--striped': config.value.appearance.striped,
    'base-table--hoverable': config.value.appearance.hoverable,
    'base-table--loading': loading.value,
    'base-table--empty': isEmpty.value,
    'base-table--responsive': config.value.responsive.enabled
  }
])

const containerStyles = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
}))

const tableWrapperClasses = computed(() => [
  'table-wrapper',
  {
    'table-wrapper--sticky-header': props.stickyHeader,
    'table-wrapper--sticky-footer': props.stickyFooter,
    'table-wrapper--virtual': config.value.virtual.enabled
  }
])

const tableWrapperStyles = computed(() => {
  const styles: Record<string, any> = {}
  
  if (props.stickyHeader) {
    styles.overflowY = 'auto'
  }
  
  return styles
})

const tableClasses = computed(() => [
  'base-table',
  {
    'table-fixed': visibleColumns.value.some(col => col.width.type === 'fixed'),
    'table-auto': visibleColumns.value.every(col => col.width.type === 'auto')
  }
])

// Toolbar computed
const showToolbar = computed(() => props.showToolbar)

const toolbarActions = computed(() => ({
  export: dataActions.exportData,
  refresh: dataActions.refreshData,
  configure: () => { showConfigDialog.value = true },
  selectAll: dataActions.selectAll,
  deselectAll: dataActions.deselectAll,
  deleteSelected: () => {
    const selectedIds = Array.from(selectedItems.value)
    dataActions.removeItems(selectedIds)
  }
}))

const toolbarProps = computed(() => ({
  totalItems: totalItems.value,
  selectedCount: selectedCount.value,
  hasData: hasData.value,
  loading: loading.value,
  config: config.value
}))

// Pagination computed
const showPagination = computed(() => 
  props.showPagination && config.value.pagination.enabled && hasData.value
)

const paginationControls = computed(() => ({
  currentPage: currentPage.value,
  pageSize: currentPageSize.value,
  totalItems: totalItems.value,
  totalPages: Math.ceil(totalItems.value / currentPageSize.value)
}))

const paginationProps = computed(() => ({
  ...paginationControls.value,
  ...config.value.pagination,
  disabled: loading.value
}))

// =============================================================================
// 🎯 Event Handlers
// =============================================================================

// Data events
const handleDataChanged = (newData: TableItem[], sortFilterConfig: SortFilterConfig) => {
  sortedFilteredData.value = newData
  emit('data-changed', newData)
}

const handleSortFilterConfigChanged = (newConfig: SortFilterConfig) => {
  sortFilterConfig.value = newConfig
  emit('sort-changed', newConfig.sorts)
  emit('filter-changed', newConfig.filters)
}

// Row events
const handleRowClick = (item: TableItem, event: MouseEvent) => {
  if (config.value.behavior.clickAction === 'select') {
    handleRowSelect(item.id, !selectedItems.value.has(item.id))
  } else if (config.value.behavior.clickAction === 'expand') {
    handleRowExpand(item.id, !expandedItems.value.has(item.id))
  }
  
  emit('item-click', item, event)
}

const handleRowSelect = (id: string | number, selected: boolean) => {
  if (selected) {
    dataActions.selectItems([id], !config.value.behavior.multiSelect)
  } else {
    dataActions.selectItems([id], false)
  }
  
  const item = data.value.find(item => item.id === id)
  if (item) {
    emit('item-selected', item, selected)
  }
  
  emit('selection-changed', selectedData.value)
}

const handleRowExpand = (id: string | number, expanded: boolean) => {
  dataActions.expandItems([id], expanded)
}

// Edit events
const handleCellEdit = (id: string | number, field: string, value: any) => {
  dataActions.updateItem(id, { [field]: value })
  
  const item = data.value.find(item => item.id === id)
  if (item) {
    emit('edit-save', item, field, value)
  }
}

const handleEditStart = (id: string | number, field: string) => {
  dataActions.startEdit(id)
  
  const item = data.value.find(item => item.id === id)
  if (item) {
    emit('edit-start', item, field)
  }
}

const handleEditSave = async (id: string | number, field: string, value: any) => {
  try {
    await dataActions.saveEdit(id, { [field]: value })
    
    const item = data.value.find(item => item.id === id)
    if (item) {
      emit('edit-save', item, field, value)
    }
  } catch (error) {
    const item = data.value.find(item => item.id === id)
    if (item) {
      emit('edit-error', item, field, error as Error)
    }
  }
}

const handleEditCancel = (id: string | number, field: string) => {
  dataActions.cancelEdit(id)
  
  const item = data.value.find(item => item.id === id)
  if (item) {
    emit('edit-cancel', item, field)
  }
}

// Column events
const handleColumnResize = (column: TableColumn, newWidth: number) => {
  const newWidthConfig = { ...column.width, value: newWidth }
  configActions.updateColumn(column.id, { width: newWidthConfig })
  emit('column-resized', column, newWidth)
}

const handleColumnSort = (columnId: string, direction: 'asc' | 'desc' | null) => {
  // This will be handled by BaseSortFilter
  console.log('Column sort:', columnId, direction)
}

const handleColumnFilter = (columnId: string, value: any) => {
  // This will be handled by BaseSortFilter
  console.log('Column filter:', columnId, value)
}

// Toolbar events
const handleExport = async (format: 'csv' | 'excel' | 'json', options: ExportOptions) => {
  emit('export-started', format, options)
  
  try {
    await dataActions.exportData(format, options)
    emit('export-completed', new Blob(), options)
  } catch (error) {
    console.error('Export failed:', error)
  }
}

const handleRefresh = async () => {
  await dataActions.refreshData()
}

const handleConfigure = () => {
  showConfigDialog.value = true
}

// Pagination events
const handlePageChange = (page: number) => {
  currentPage.value = page
  emit('page-changed', page, currentPageSize.value)
}

const handlePageSizeChange = (pageSize: number) => {
  currentPageSize.value = pageSize
  currentPage.value = 1 // Reset to first page
  emit('page-size-changed', pageSize)
}

// Configuration events
const handleConfigSave = (newConfig: TableConfig) => {
  configActions.updateConfig(newConfig)
  showConfigDialog.value = false
  emit('config-changed', newConfig)
}

const handleConfigCancel = () => {
  showConfigDialog.value = false
}

// =============================================================================
// 🔄 Watchers
// =============================================================================

// Watch props.data changes
watch(
  () => props.data,
  (newData) => {
    dataActions.setData(newData)
  },
  { deep: true }
)

// Watch props.config changes
watch(
  () => props.config,
  (newConfig) => {
    if (newConfig) {
      configActions.updateConfig(newConfig)
    }
  },
  { deep: true }
)

// =============================================================================
// 🎯 Provide/Inject
// =============================================================================

// Provide table context for child components
provide('tableConfig', config)
provide('tableColumns', columns)
provide('tableData', data)
provide('tableActions', {
  ...dataActions,
  ...configActions
})

// =============================================================================
// 🔄 Lifecycle
// =============================================================================

onMounted(async () => {
  // Initialize data
  dataActions.setData(props.data)
  
  // Setup sort/filter integration
  await nextTick()
  
  // Initialize sort/filter config based on columns
  if (visibleColumns.value.length > 0) {
    // Create initial sort/filter config
    // This would integrate with BaseSortFilter
  }
})

onUnmounted(() => {
  // Cleanup
})

// =============================================================================
// 📤 Expose Public API
// =============================================================================

defineExpose({
  // Data operations
  setData: dataActions.setData,
  getData: () => data.value,
  getSelectedData: () => selectedData.value,
  
  // Selection operations
  selectAll: dataActions.selectAll,
  deselectAll: dataActions.deselectAll,
  selectItems: dataActions.selectItems,
  
  // Configuration operations
  getConfig: () => config.value,
  updateConfig: configActions.updateConfig,
  resetConfig: configActions.resetConfig,
  
  // Export operations
  exportData: dataActions.exportData,
  
  // Utility operations
  refresh: dataActions.refreshData,
  validate: configActions.validateConfiguration,
  
  // DOM references
  tableElement: tableRef,
  wrapperElement: tableWrapperRef
})
</script>

<style scoped>
/* =============================================================================
   🎨 Base Table Styles
   ============================================================================= */

.base-table-container {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Size variants */
.base-table--small {
  font-size: 0.875rem;
}

.base-table--default {
  font-size: 1rem;
}

.base-table--large {
  font-size: 1.125rem;
}

/* Theme variants */
.base-table--light {
  background-color: white;
  color: #111827;
}

.base-table--dark {
  background-color: #111827;
  color: white;
}

/* Density variants */
.base-table--density-compact .table-cell {
  padding: 0.25rem 0.5rem;
}

.base-table--density-default .table-cell {
  padding: 0.5rem 0.75rem;
}

.base-table--density-comfortable .table-cell {
  padding: 0.75rem 1rem;
}

/* Visual modifiers */
.base-table--bordered {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.base-table--bordered.base-table--dark {
  border-color: #374151;
}

.base-table--striped tbody tr:nth-child(even) {
  background-color: #f9fafb;
}

.base-table--striped.base-table--dark tbody tr:nth-child(even) {
  background-color: #1f2937;
}

.base-table--hoverable tbody tr:hover {
  background-color: #f3f4f6;
}

.base-table--hoverable.base-table--dark tbody tr:hover {
  background-color: #1f2937;
}

/* State modifiers */
.base-table--loading {
  opacity: 0.75;
  pointer-events: none;
}

.base-table--empty .table-body {
  text-align: center;
  color: #6b7280;
}

/* =============================================================================
   🖼️ Table Structure
   ============================================================================= */

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.base-table--dark .table-toolbar {
  border-bottom-color: #374151;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
}

.table-wrapper--sticky-header {
  overflow-y: auto;
}

.table-wrapper--sticky-header th {
  position: sticky;
  top: 0;
  z-index: 10;
}

.base-table {
  width: 100%;
  border-collapse: collapse;
}

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.base-table--dark .table-pagination {
  border-top-color: #374151;
}

/* =============================================================================
   📱 Responsive Styles
   ============================================================================= */

.base-table--responsive {
  overflow-x: auto;
}

@media (max-width: 768px) {
  .base-table--responsive .table-wrapper {
    overflow-x: auto;
  }
  
  .base-table--responsive .base-table {
    min-width: 100%;
  }
}

/* =============================================================================
   💫 Special States
   ============================================================================= */

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: #6b7280;
}

.empty-icon {
  font-size: 2.25rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.125rem;
  font-weight: 500;
}

.table-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: #6b7280;
}

.loading-spinner {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  animation: spin 2s linear infinite;
}

.loading-text {
  font-size: 1rem;
}

/* =============================================================================
   🎭 Animations
   ============================================================================= */

.base-table-container {
  transition: opacity 0.2s ease-in-out;
}

.table-cell {
  transition: background-color 0.15s ease-in-out;
}

/* Loading animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.base-table--loading .table-cell {
  animation: pulse 2s infinite;
}

/* Hover animations */
.base-table--hoverable tbody tr {
  transition: background-color 0.15s ease-in-out;
}
</style>