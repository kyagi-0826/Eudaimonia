<!--
  @fileoverview TableToolbar Component
  @description テーブルの包括的ツールバー（検索、フィルタ、設定、エクスポート、アクション）
  🔥 高機能ツールバー：グローバル検索、一括操作、設定ダイアログ、カスタムアクション
-->

<template>
  <div 
    :class="toolbarClasses"
    role="toolbar"
    :aria-label="toolbarAriaLabel"
  >
    <!-- Left Section: Title & Info -->
    <div class="toolbar-section toolbar-section--left">
      <!-- Table Title -->
      <div v-if="title" class="toolbar-title">
        <h3 class="title-text">{{ title }}</h3>
        <p v-if="subtitle" class="title-subtitle">{{ subtitle }}</p>
      </div>

      <!-- Data Info -->
      <div class="toolbar-info">
        <span class="info-item">
          <span class="info-label">総数:</span>
          <span class="info-value">{{ totalItems }}</span>
        </span>
        <span v-if="selectedItems.length > 0" class="info-item info-item--selected">
          <span class="info-label">選択:</span>
          <span class="info-value">{{ selectedItems.length }}</span>
        </span>
        <span v-if="filteredItems < totalItems" class="info-item info-item--filtered">
          <span class="info-label">表示:</span>
          <span class="info-value">{{ filteredItems }}</span>
        </span>
      </div>
    </div>

    <!-- Center Section: Search & Filters -->
    <div class="toolbar-section toolbar-section--center">
      <!-- Global Search -->
      <div v-if="searchable" class="toolbar-search">
        <div class="search-input-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            :placeholder="searchPlaceholder"
            :aria-label="searchAriaLabel"
            @input="handleSearchInput"
            @keydown.escape="clearSearch"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="search-clear"
            @click="clearSearch"
            aria-label="検索をクリア"
            title="検索をクリア (Esc)"
          >
            ✕
          </button>
          <span class="search-icon" aria-hidden="true">🔍</span>
        </div>
      </div>

      <!-- Quick Filters -->
      <div v-if="quickFilters.length > 0" class="toolbar-filters">
        <div class="filter-chips">
          <button
            v-for="filter in quickFilters"
            :key="filter.key"
            type="button"
            :class="quickFilterClasses(filter)"
            @click="toggleQuickFilter(filter)"
            :aria-pressed="isQuickFilterActive(filter)"
            :title="filter.description"
          >
            <span v-if="filter.icon" class="filter-icon">{{ filter.icon }}</span>
            <span class="filter-label">{{ filter.label }}</span>
            <span v-if="isQuickFilterActive(filter)" class="filter-count">
              {{ getQuickFilterCount(filter) }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Right Section: Actions & Settings -->
    <div class="toolbar-section toolbar-section--right">
      <!-- Custom Actions -->
      <div v-if="actions.length > 0" class="toolbar-actions">
        <!-- Bulk Actions (when items selected) -->
        <div v-if="selectedItems.length > 0" class="bulk-actions">
          <button
            v-for="action in bulkActions"
            :key="action.key"
            type="button"
            :class="actionClasses(action)"
            @click="handleAction(action)"
            :disabled="action.disabled"
            :title="action.description"
          >
            <span v-if="action.icon" class="action-icon">{{ action.icon }}</span>
            <span class="action-label">{{ action.label }}</span>
          </button>
        </div>

        <!-- Regular Actions -->
        <div v-else class="regular-actions">
          <button
            v-for="action in regularActions"
            :key="action.key"
            type="button"
            :class="actionClasses(action)"
            @click="handleAction(action)"
            :disabled="action.disabled"
            :title="action.description"
          >
            <span v-if="action.icon" class="action-icon">{{ action.icon }}</span>
            <span class="action-label">{{ action.label }}</span>
          </button>
        </div>
      </div>

      <!-- Export Menu -->
      <div v-if="exportable" class="toolbar-export">
        <button
          type="button"
          class="export-toggle"
          :class="{ 'active': showExportMenu }"
          @click="showExportMenu = !showExportMenu"
          :aria-expanded="showExportMenu"
          aria-label="エクスポート"
          title="データをエクスポート"
        >
          <span class="export-icon">📊</span>
          <span class="export-label">エクスポート</span>
          <span class="dropdown-arrow">{{ showExportMenu ? '▲' : '▼' }}</span>
        </button>
        
        <div v-if="showExportMenu" class="export-menu">
          <button
            v-for="format in exportFormats"
            :key="format.type"
            type="button"
            class="export-option"
            @click="handleExport(format.type)"
            :disabled="format.disabled"
          >
            <span class="export-format-icon">{{ format.icon }}</span>
            <div class="export-format-info">
              <span class="export-format-name">{{ format.name }}</span>
              <span class="export-format-desc">{{ format.description }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Settings Menu -->
      <div class="toolbar-settings">
        <button
          type="button"
          class="settings-toggle"
          :class="{ 'active': showSettingsMenu }"
          @click="showSettingsMenu = !showSettingsMenu"
          :aria-expanded="showSettingsMenu"
          aria-label="設定"
          title="テーブル設定"
        >
          <span class="settings-icon">⚙️</span>
          <span class="settings-label">設定</span>
        </button>
        
        <div v-if="showSettingsMenu" class="settings-menu">
          <!-- Column Visibility -->
          <div class="settings-section">
            <h4 class="settings-section-title">カラム表示</h4>
            <div class="column-toggles">
              <label
                v-for="column in configurableColumns"
                :key="column.id"
                class="column-toggle"
              >
                <input
                  type="checkbox"
                  :checked="column.visible"
                  @change="toggleColumnVisibility(column.id)"
                />
                <span class="column-name">{{ column.label }}</span>
              </label>
            </div>
          </div>

          <!-- Display Options -->
          <div class="settings-section">
            <h4 class="settings-section-title">表示オプション</h4>
            <div class="display-options">
              <label class="option-toggle">
                <input
                  type="checkbox"
                  :checked="config.appearance.striped"
                  @change="updateAppearance('striped', ($event.target as HTMLInputElement)?.checked)"
                />
                <span>ストライプ表示</span>
              </label>
              <label class="option-toggle">
                <input
                  type="checkbox"
                  :checked="config.appearance.bordered"
                  @change="updateAppearance('bordered', ($event.target as HTMLInputElement)?.checked)"
                />
                <span>境界線表示</span>
              </label>
              <label class="option-toggle">
                <input
                  type="checkbox"
                  :checked="config.appearance.hoverable"
                  @change="updateAppearance('hoverable', ($event.target as HTMLInputElement)?.checked)"
                />
                <span>ホバー効果</span>
              </label>
            </div>
          </div>

          <!-- Size Options -->
          <div class="settings-section">
            <h4 class="settings-section-title">サイズ</h4>
            <div class="size-options">
              <label
                v-for="size in sizeOptions"
                :key="size.value"
                class="size-option"
              >
                <input
                  type="radio"
                  :value="size.value"
                  :checked="config.appearance.size === size.value"
                  @change="updateAppearance('size', size.value)"
                />
                <span>{{ size.label }}</span>
              </label>
            </div>
          </div>
          
          <!-- Preset Actions -->
          <div class="settings-section">
            <h4 class="settings-section-title">プリセット</h4>
            <div class="preset-actions">
              <button
                type="button"
                class="preset-action"
                @click="showPresetDialog = true"
              >
                💾 現在の設定を保存
              </button>
              <button
                type="button"
                class="preset-action"
                @click="resetToDefaults"
              >
                🔄 デフォルトに戻す
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Advanced Settings Button -->
      <button
        v-if="showAdvancedSettings"
        type="button"
        class="advanced-settings-btn"
        @click="$emit('open-advanced-settings')"
        title="詳細設定を開く"
      >
        <span class="advanced-icon">🔧</span>
      </button>
    </div>

    <!-- Preset Save Dialog -->
    <div v-if="showPresetDialog" class="preset-dialog-overlay" @click.self="showPresetDialog = false">
      <div class="preset-dialog">
        <h3>プリセット保存</h3>
        <div class="preset-form">
          <label for="preset-name">プリセット名:</label>
          <input
            id="preset-name"
            v-model="presetName"
            type="text"
            placeholder="例: モバイル用設定"
            class="preset-input"
          />
          <div class="preset-dialog-actions">
            <button
              type="button"
              class="preset-btn preset-btn--cancel"
              @click="cancelPresetSave"
            >
              キャンセル
            </button>
            <button
              type="button"
              class="preset-btn preset-btn--save"
              @click="savePreset"
              :disabled="!presetName.trim()"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { 
  TableConfig, 
  TableColumn, 
  TableItem,
  ExportOptions 
} from '../types'

// =============================================================================
// 📝 Component Props & Emits
// =============================================================================

export interface Props {
  config: TableConfig                      // テーブル設定
  columns: TableColumn[]                   // カラム設定
  totalItems: number                       // 総アイテム数
  filteredItems: number                    // フィルタ後アイテム数
  selectedItems: TableItem[]               // 選択されたアイテム
  searchable?: boolean                     // 検索機能有効
  exportable?: boolean                     // エクスポート機能有効
  title?: string                           // タイトル
  subtitle?: string                        // サブタイトル
  showAdvancedSettings?: boolean           // 詳細設定ボタン表示
  actions?: ToolbarAction[]                // カスタムアクション
  quickFilters?: QuickFilter[]             // クイックフィルタ
}

export interface ToolbarAction {
  key: string
  label: string
  icon?: string
  type: 'regular' | 'bulk'                // 通常 | 一括操作
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  description?: string
  handler: (selectedItems: TableItem[]) => void
}

export interface QuickFilter {
  key: string
  label: string
  icon?: string
  description?: string
  condition: (item: TableItem) => boolean
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  searchable: true,
  exportable: true,
  showAdvancedSettings: false,
  actions: () => [],
  quickFilters: () => []
})

const emit = defineEmits<{
  'search-changed': [query: string]
  'filter-changed': [filters: QuickFilter[]]
  'export-data': [format: string, options: ExportOptions]
  'config-changed': [config: Partial<TableConfig>]
  'column-visibility-changed': [columnId: string, visible: boolean]
  'action-triggered': [action: ToolbarAction, selectedItems: TableItem[]]
  'open-advanced-settings': []
  'preset-saved': [name: string, config: TableConfig]
}>()

// =============================================================================
// 📊 Reactive State
// =============================================================================

const searchQuery = ref('')
const showExportMenu = ref(false)
const showSettingsMenu = ref(false)
const showPresetDialog = ref(false)
const presetName = ref('')
const activeQuickFilters = ref<Set<string>>(new Set())

// =============================================================================
// 📊 Computed Properties
// =============================================================================

// Categorized actions
const bulkActions = computed(() => 
  props.actions.filter(action => action.type === 'bulk')
)

const regularActions = computed(() => 
  props.actions.filter(action => action.type !== 'bulk')
)

const configurableColumns = computed(() =>
  props.columns.filter(col => !col.sticky)
)

// Styling
const toolbarClasses = computed(() => [
  'table-toolbar',
  {
    'toolbar--has-selections': props.selectedItems.length > 0,
    'toolbar--compact': props.config.appearance.size === 'small'
  }
])

// Size options
const sizeOptions = [
  { value: 'small', label: 'コンパクト' },
  { value: 'default', label: '標準' },
  { value: 'large', label: '大きめ' }
]

// Export formats
const exportFormats = [
  {
    type: 'csv',
    name: 'CSV',
    description: 'Excel等で開けます',
    icon: '📄',
    disabled: false
  },
  {
    type: 'excel',
    name: 'Excel',
    description: 'Excel形式(.xlsx)',
    icon: '📊',
    disabled: false
  },
  {
    type: 'json',
    name: 'JSON',
    description: '開発者向けデータ形式',
    icon: '💾',
    disabled: false
  }
]

// ARIA labels
const toolbarAriaLabel = computed(() => 
  `テーブル操作ツールバー: ${props.totalItems}件のデータ`
)

const searchAriaLabel = computed(() => 
  'データを検索'
)

const searchPlaceholder = computed(() => 
  `${props.totalItems}件から検索...`
)

// =============================================================================
// 🎯 Event Handlers
// =============================================================================

const handleSearchInput = () => {
  emit('search-changed', searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('search-changed', '')
}

const toggleQuickFilter = (filter: QuickFilter) => {
  if (activeQuickFilters.value.has(filter.key)) {
    activeQuickFilters.value.delete(filter.key)
  } else {
    activeQuickFilters.value.add(filter.key)
  }
  
  const activeFilters = props.quickFilters.filter(f => 
    activeQuickFilters.value.has(f.key)
  )
  
  emit('filter-changed', activeFilters)
}

const isQuickFilterActive = (filter: QuickFilter): boolean => {
  return activeQuickFilters.value.has(filter.key)
}

const getQuickFilterCount = (filter: QuickFilter): number => {
  // This would be calculated by the parent component
  return 0 // Placeholder
}

const quickFilterClasses = (filter: QuickFilter) => [
  'filter-chip',
  {
    'filter-chip--active': isQuickFilterActive(filter)
  }
]

const handleAction = (action: ToolbarAction) => {
  action.handler(props.selectedItems)
  emit('action-triggered', action, props.selectedItems)
}

const actionClasses = (action: ToolbarAction) => [
  'toolbar-action',
  `action--${action.variant || 'secondary'}`,
  {
    'action--disabled': action.disabled
  }
]

const handleExport = (format: string) => {
  const options: ExportOptions = {
    selectedOnly: props.selectedItems.length > 0,
    includeHeaders: true,
    filename: `table_export_${new Date().toISOString().split('T')[0]}`
  }
  
  emit('export-data', format, options)
  showExportMenu.value = false
}

const toggleColumnVisibility = (columnId: string) => {
  emit('column-visibility-changed', columnId, true) // Will be toggled by parent
}

const updateAppearance = (key: string, value: any) => {
  const updates = {
    appearance: {
      ...props.config.appearance,
      [key]: value
    }
  }
  emit('config-changed', updates)
}

const resetToDefaults = () => {
  // Reset to default configuration
  const defaultConfig: Partial<TableConfig> = {
    appearance: {
      size: 'default',
      bordered: true,
      striped: false,
      hoverable: true,
      theme: 'auto',
      density: 'default'
    }
  }
  
  emit('config-changed', defaultConfig)
  showSettingsMenu.value = false
}

const savePreset = () => {
  if (!presetName.value.trim()) return
  
  emit('preset-saved', presetName.value.trim(), props.config)
  cancelPresetSave()
}

const cancelPresetSave = () => {
  showPresetDialog.value = false
  presetName.value = ''
}

// Close menus when clicking outside
const closeMenus = () => {
  showExportMenu.value = false
  showSettingsMenu.value = false
}

// Watch for outside clicks
watch([showExportMenu, showSettingsMenu], () => {
  if (showExportMenu.value || showSettingsMenu.value) {
    document.addEventListener('click', closeMenus)
  } else {
    document.removeEventListener('click', closeMenus)
  }
})
</script>

<style scoped>
/* =============================================================================
   🎨 Toolbar Layout
   ============================================================================= */

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  min-height: 60px;
  flex-wrap: wrap;
}

.toolbar--compact {
  min-height: 48px;
  padding: 8px 12px;
  gap: 12px;
}

.toolbar--has-selections {
  background-color: #eff6ff;
  border-bottom-color: #3b82f6;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.toolbar-section--left {
  flex: 1;
  justify-content: flex-start;
}

.toolbar-section--center {
  flex: 2;
  justify-content: center;
  max-width: 600px;
}

.toolbar-section--right {
  flex: 1;
  justify-content: flex-end;
}

/* =============================================================================
   📝 Title & Info Section
   ============================================================================= */

.toolbar-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-text {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.title-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.2;
}

.toolbar-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.875rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-label {
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  color: #111827;
  font-weight: 600;
}

.info-item--selected .info-value {
  color: #2563eb;
}

.info-item--filtered .info-value {
  color: #059669;
}

/* =============================================================================
   🔍 Search Section
   ============================================================================= */

.toolbar-search {
  flex: 1;
  max-width: 400px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 8px 40px 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  transition: all 0.15s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.search-icon {
  position: absolute;
  right: 12px;
  color: #6b7280;
  pointer-events: none;
  font-size: 0.875rem;
}

.search-clear {
  position: absolute;
  right: 32px;
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s ease;
}

.search-clear:hover {
  background-color: #f3f4f6;
  color: #374151;
}

/* =============================================================================
   🏷️ Quick Filters
   ============================================================================= */

.toolbar-filters {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  font-size: 0.75rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.filter-chip:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.filter-chip--active {
  background-color: #dbeafe;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.filter-icon {
  font-size: 0.625rem;
}

.filter-count {
  background-color: #1d4ed8;
  color: white;
  padding: 1px 4px;
  border-radius: 8px;
  font-size: 0.625rem;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

/* =============================================================================
   ⚡ Actions Section
   ============================================================================= */

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bulk-actions,
.regular-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.action--primary {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.action--primary:hover:not(.action--disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.action--secondary {
  background-color: white;
  border-color: #d1d5db;
  color: #374151;
}

.action--secondary:hover:not(.action--disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.action--danger {
  background-color: #ef4444;
  border-color: #ef4444;
  color: white;
}

.action--danger:hover:not(.action--disabled) {
  background-color: #dc2626;
  border-color: #dc2626;
}

.action--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-icon {
  font-size: 0.875rem;
}

/* =============================================================================
   📊 Export Menu
   ============================================================================= */

.toolbar-export {
  position: relative;
}

.export-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.15s ease;
}

.export-toggle:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.export-toggle.active {
  background-color: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.export-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 200px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.export-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.15s ease;
}

.export-option:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.export-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-format-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.export-format-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.export-format-name {
  font-weight: 500;
  color: #111827;
}

.export-format-desc {
  font-size: 0.75rem;
  color: #6b7280;
}

/* =============================================================================
   ⚙️ Settings Menu
   ============================================================================= */

.toolbar-settings {
  position: relative;
}

.settings-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.15s ease;
}

.settings-toggle:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.settings-toggle.active {
  background-color: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.settings-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 280px;
  max-width: 320px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 400px;
  overflow-y: auto;
}

.settings-section {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.settings-section:last-child {
  border-bottom: none;
}

.settings-section-title {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

/* Column toggles */
.column-toggles {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.column-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.column-toggle input[type="checkbox"] {
  margin: 0;
}

/* Display options */
.display-options,
.size-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.option-toggle,
.size-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

/* Preset actions */
.preset-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preset-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition: background-color 0.15s ease;
}

.preset-action:hover {
  background-color: #f3f4f6;
}

/* =============================================================================
   💾 Preset Dialog
   ============================================================================= */

.preset-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.preset-dialog {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.preset-dialog h3 {
  margin: 0 0 16px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.preset-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preset-form label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.preset-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.preset-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.preset-dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}

.preset-btn {
  padding: 6px 16px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-btn--cancel {
  background: white;
  border-color: #d1d5db;
  color: #374151;
}

.preset-btn--cancel:hover {
  background-color: #f9fafb;
}

.preset-btn--save {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.preset-btn--save:hover:not(:disabled) {
  background-color: #2563eb;
}

.preset-btn--save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* =============================================================================
   📱 Responsive Design
   ============================================================================= */

@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .toolbar-section {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .toolbar-section--center {
    order: 1;
  }
  
  .toolbar-section--left {
    order: 2;
  }
  
  .toolbar-section--right {
    order: 3;
  }
  
  .toolbar-info {
    justify-content: space-between;
  }
  
  .toolbar-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  
  .settings-menu,
  .export-menu {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 320px;
  }
}
</style>