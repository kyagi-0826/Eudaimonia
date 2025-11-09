<!--
  @fileoverview TableSettings Component
  @description テーブル全体設定ダイアログ（表示オプション、パフォーマンス、エクスポート設定）
-->

<template>
  <div class="table-settings" :class="settingsClasses">
    <!-- Backdrop -->
    <div v-if="isOpen" class="settings-backdrop" @click="handleBackdropClick"></div>

    <!-- Settings Modal -->
    <div v-if="isOpen" class="settings-modal" role="dialog" aria-labelledby="settings-title" aria-modal="true">
      <!-- Header -->
      <div class="settings-header">
        <h2 id="settings-title" class="settings-title">テーブル設定</h2>
        <button
          type="button"
          class="close-btn"
          @click="$emit('close')"
          aria-label="設定を閉じる"
          title="閉じる"
        >
          ×
        </button>
      </div>

      <!-- Settings Tabs -->
      <div class="settings-tabs">
        <button
          v-for="tab in settingsTabs"
          :key="tab.id"
          type="button"
          :class="getTabClasses(tab.id)"
          @click="activeTab = tab.id"
          :aria-selected="activeTab === tab.id"
          role="tab"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- Settings Content -->
      <div class="settings-content">
        <!-- Display Settings Tab -->
        <div v-if="activeTab === 'display'" class="settings-tab-content">
          <div class="settings-section">
            <h3 class="section-title">表示オプション</h3>
            
            <!-- Table Size -->
            <div class="setting-item">
              <label class="setting-label">テーブルサイズ</label>
              <div class="setting-control">
                <div class="size-options">
                  <label
                    v-for="size in tableSizes"
                    :key="size.value"
                    class="size-option"
                  >
                    <input
                      v-model="localSettings.size"
                      type="radio"
                      :value="size.value"
                      class="size-radio"
                    />
                    <span class="size-label">{{ size.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Row Height -->
            <div class="setting-item">
              <label class="setting-label">行の高さ</label>
              <div class="setting-control">
                <input
                  v-model.number="localSettings.rowHeight"
                  type="range"
                  :min="32"
                  :max="80"
                  step="4"
                  class="height-slider"
                />
                <span class="height-value">{{ localSettings.rowHeight }}px</span>
              </div>
            </div>

            <!-- Border Style -->
            <div class="setting-item">
              <label class="setting-label">ボーダースタイル</label>
              <div class="setting-control">
                <select v-model="localSettings.borderStyle" class="border-select">
                  <option value="none">なし</option>
                  <option value="horizontal">水平線のみ</option>
                  <option value="vertical">垂直線のみ</option>
                  <option value="all">すべて</option>
                </select>
              </div>
            </div>

            <!-- Zebra Stripes -->
            <div class="setting-item">
              <label class="setting-checkbox">
                <input
                  v-model="localSettings.zebraStripes"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">ストライプ表示</span>
              </label>
            </div>

            <!-- Hover Effect -->
            <div class="setting-item">
              <label class="setting-checkbox">
                <input
                  v-model="localSettings.hoverEffect"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">ホバーエフェクト</span>
              </label>
            </div>
          </div>

          <!-- Header Settings -->
          <div class="settings-section">
            <h3 class="section-title">ヘッダー設定</h3>
            
            <div class="setting-item">
              <label class="setting-checkbox">
                <input
                  v-model="localSettings.stickyHeader"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">ヘッダー固定</span>
              </label>
            </div>

            <div class="setting-item">
              <label class="setting-checkbox">
                <input
                  v-model="localSettings.showColumnLines"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">カラム区切り線</span>
              </label>
            </div>

            <div class="setting-item">
              <label class="setting-checkbox">
                <input
                  v-model="localSettings.resizableColumns"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">カラムリサイズ</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Performance Settings Tab -->
        <div v-if="activeTab === 'performance'" class="settings-tab-content">
          <div class="settings-section">
            <h3 class="section-title">パフォーマンス設定</h3>
            
            <!-- Virtual Scrolling -->
            <div class="setting-item">
              <label class="setting-checkbox">
                <input
                  v-model="localSettings.virtualScrolling"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">仮想スクロール</span>
              </label>
              <div class="setting-description">
                大量データ表示時のパフォーマンスを向上させます
              </div>
            </div>

            <!-- Buffer Size -->
            <div v-if="localSettings.virtualScrolling" class="setting-item">
              <label class="setting-label">バッファサイズ</label>
              <div class="setting-control">
                <input
                  v-model.number="localSettings.bufferSize"
                  type="number"
                  :min="10"
                  :max="100"
                  class="number-input"
                />
                <span class="input-suffix">行</span>
              </div>
            </div>

            <!-- Lazy Loading -->
            <div class="setting-item">
              <label class="setting-checkbox">
                <input
                  v-model="localSettings.lazyLoading"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">遅延読み込み</span>
              </label>
              <div class="setting-description">
                画像やリンクの読み込みを遅延させます
              </div>
            </div>

            <!-- Debounce Search -->
            <div class="setting-item">
              <label class="setting-label">検索遅延時間</label>
              <div class="setting-control">
                <input
                  v-model.number="localSettings.searchDebounce"
                  type="range"
                  :min="100"
                  :max="1000"
                  step="100"
                  class="debounce-slider"
                />
                <span class="debounce-value">{{ localSettings.searchDebounce }}ms</span>
              </div>
            </div>

            <!-- Cache Settings -->
            <div class="setting-item">
              <label class="setting-checkbox">
                <input
                  v-model="localSettings.cacheEnabled"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">データキャッシュ</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Export Settings Tab -->
        <div v-if="activeTab === 'export'" class="settings-tab-content">
          <div class="settings-section">
            <h3 class="section-title">エクスポート設定</h3>
            
            <!-- Default Format -->
            <div class="setting-item">
              <label class="setting-label">デフォルト形式</label>
              <div class="setting-control">
                <select v-model="localSettings.defaultExportFormat" class="format-select">
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="json">JSON</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
            </div>

            <!-- Include Options -->
            <div class="setting-item">
              <label class="setting-label">含める内容</label>
              <div class="setting-control">
                <div class="include-options">
                  <label class="setting-checkbox">
                    <input
                      v-model="localSettings.includeHeaders"
                      type="checkbox"
                      class="checkbox-input"
                    />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">ヘッダー行</span>
                  </label>
                  
                  <label class="setting-checkbox">
                    <input
                      v-model="localSettings.includeFilters"
                      type="checkbox"
                      class="checkbox-input"
                    />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">フィルタ情報</span>
                  </label>
                  
                  <label class="setting-checkbox">
                    <input
                      v-model="localSettings.includeHiddenColumns"
                      type="checkbox"
                      class="checkbox-input"
                    />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">非表示カラム</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- CSV Settings -->
            <div v-if="localSettings.defaultExportFormat === 'csv'" class="setting-item">
              <label class="setting-label">CSV区切り文字</label>
              <div class="setting-control">
                <select v-model="localSettings.csvDelimiter" class="delimiter-select">
                  <option value=",">カンマ (,)</option>
                  <option value=";">セミコロン (;)</option>
                  <option value="\t">タブ</option>
                  <option value="|">パイプ (|)</option>
                </select>
              </div>
            </div>

            <!-- File Naming -->
            <div class="setting-item">
              <label class="setting-label">ファイル名形式</label>
              <div class="setting-control">
                <input
                  v-model="localSettings.filenameTemplate"
                  type="text"
                  class="filename-input"
                  placeholder="table_export_{date}_{time}"
                />
                <div class="filename-variables">
                  使用可能な変数: {date}, {time}, {tableName}, {recordCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Accessibility Settings Tab -->
        <div v-if="activeTab === 'accessibility'" class="settings-tab-content">
          <div class="settings-section">
            <h3 class="section-title">アクセシビリティ設定</h3>
            
            <!-- High Contrast -->
            <div class="setting-item">
              <label class="setting-checkbox">
                <input
                  v-model="localSettings.highContrast"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">ハイコントラスト</span>
              </label>
            </div>

            <!-- Reduced Motion -->
            <div class="setting-item">
              <label class="setting-checkbox">
                <input
                  v-model="localSettings.reducedMotion"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">アニメーション軽減</span>
              </label>
            </div>

            <!-- Screen Reader -->
            <div class="setting-item">
              <label class="setting-checkbox">
                <input
                  v-model="localSettings.screenReaderOptimized"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">スクリーンリーダー最適化</span>
              </label>
            </div>

            <!-- Keyboard Navigation -->
            <div class="setting-item">
              <label class="setting-checkbox">
                <input
                  v-model="localSettings.enhancedKeyboardNav"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">強化キーボードナビゲーション</span>
              </label>
            </div>

            <!-- Focus Indicators -->
            <div class="setting-item">
              <label class="setting-label">フォーカス表示</label>
              <div class="setting-control">
                <select v-model="localSettings.focusStyle" class="focus-select">
                  <option value="default">デフォルト</option>
                  <option value="enhanced">強調</option>
                  <option value="thick">太枠</option>
                  <option value="colorful">カラフル</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="settings-footer">
        <div class="footer-left">
          <button
            type="button"
            class="reset-btn"
            @click="resetToDefaults"
            title="すべての設定をリセット"
          >
            デフォルトに戻す
          </button>
        </div>
        <div class="footer-right">
          <button
            type="button"
            class="cancel-btn"
            @click="$emit('cancel')"
          >
            キャンセル
          </button>
          <button
            type="button"
            class="apply-btn"
            @click="applySettings"
            :disabled="!hasChanges"
          >
            適用
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { TableSettings } from '../types'

export interface Props {
  isOpen: boolean
  settings: TableSettings
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'update:settings': [settings: TableSettings]
  'close': []
  'cancel': []
  'reset': []
}>()

// =============================================================================
// 📊 Reactive State
// =============================================================================

const activeTab = ref('display')
const localSettings = ref<TableSettings>({ ...props.settings })

// Settings tabs configuration
const settingsTabs = [
  { id: 'display', label: '表示', icon: '🎨' },
  { id: 'performance', label: 'パフォーマンス', icon: '⚡' },
  { id: 'export', label: 'エクスポート', icon: '📤' },
  { id: 'accessibility', label: 'アクセシビリティ', icon: '♿' }
]

// Table size options
const tableSizes = [
  { value: 'compact', label: 'コンパクト' },
  { value: 'default', label: 'デフォルト' },
  { value: 'comfortable', label: '余裕あり' }
]

// =============================================================================
// 📊 Computed Properties
// =============================================================================

const settingsClasses = computed(() => [
  'table-settings',
  {
    'settings--open': props.isOpen,
    'settings--loading': props.loading
  }
])

const hasChanges = computed(() => {
  return JSON.stringify(localSettings.value) !== JSON.stringify(props.settings)
})

// =============================================================================
// 🎯 Event Handlers & Methods
// =============================================================================

const getTabClasses = (tabId: string) => [
  'tab-btn',
  {
    'tab-btn--active': activeTab.value === tabId
  }
]

const handleBackdropClick = () => {
  emit('cancel')
}

const resetToDefaults = () => {
  localSettings.value = {
    // Display Settings
    size: 'default',
    rowHeight: 48,
    borderStyle: 'horizontal',
    zebraStripes: true,
    hoverEffect: true,
    stickyHeader: false,
    showColumnLines: true,
    resizableColumns: true,

    // Performance Settings
    virtualScrolling: false,
    bufferSize: 50,
    lazyLoading: true,
    searchDebounce: 300,
    cacheEnabled: true,

    // Export Settings
    defaultExportFormat: 'csv',
    includeHeaders: true,
    includeFilters: false,
    includeHiddenColumns: false,
    csvDelimiter: ',',
    filenameTemplate: 'table_export_{date}_{time}',

    // Accessibility Settings
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: false,
    enhancedKeyboardNav: false,
    focusStyle: 'default'
  }
  emit('reset')
}

const applySettings = () => {
  emit('update:settings', { ...localSettings.value })
  emit('close')
}

// =============================================================================
// 🔄 Watchers
// =============================================================================

watch(
  () => props.settings,
  (newSettings) => {
    if (!hasChanges.value) {
      localSettings.value = { ...newSettings }
    }
  },
  { deep: true }
)

// Reset active tab when modal opens
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      activeTab.value = 'display'
      nextTick(() => {
        // Focus management for accessibility
        const firstTab = document.querySelector('.tab-btn') as HTMLElement
        firstTab?.focus()
      })
    }
  }
)

// Handle keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.isOpen) return

  switch (event.key) {
    case 'Escape':
      emit('cancel')
      break
    case 'Tab':
      // Enhanced tab navigation for accessibility
      if (localSettings.value.enhancedKeyboardNav) {
        // Custom tab handling could go here
      }
      break
  }
}

// Add keyboard listeners
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<style scoped>
/* =============================================================================
   🎨 Settings Modal Layout
   ============================================================================= */

.table-settings {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  pointer-events: none;
}

.settings--open {
  pointer-events: auto;
}

.settings-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

.settings-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 800px;
  max-height: 90vh;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

/* =============================================================================
   📑 Settings Header
   ============================================================================= */

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.settings-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  color: #6b7280;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

/* =============================================================================
   📑 Settings Tabs
   ============================================================================= */

.settings-tabs {
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.tab-btn {
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-btn:hover {
  color: #374151;
  background-color: #f3f4f6;
}

.tab-btn--active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background-color: white;
}

/* =============================================================================
   📊 Settings Content
   ============================================================================= */

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.settings-tab-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

/* =============================================================================
   ⚙️ Setting Items
   ============================================================================= */

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-description {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
}

/* Size Options */
.size-options {
  display: flex;
  gap: 12px;
}

.size-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.size-radio {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}

.size-radio:checked {
  border-color: #3b82f6;
}

.size-radio:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background-color: #3b82f6;
  border-radius: 50%;
}

.size-label {
  font-size: 0.875rem;
  color: #374151;
}

/* Sliders */
.height-slider,
.debounce-slider {
  flex: 1;
  max-width: 200px;
}

.height-value,
.debounce-value {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  min-width: 50px;
}

/* Select Elements */
.border-select,
.format-select,
.delimiter-select,
.focus-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
}

/* Number Input */
.number-input {
  width: 80px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  text-align: center;
  font-size: 0.875rem;
}

.input-suffix {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Checkboxes */
.setting-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  background-color: white;
  position: relative;
  transition: all 0.15s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
}

/* Include Options */
.include-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Filename Input */
.filename-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.filename-variables {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
}

/* =============================================================================
   🦶 Settings Footer
   ============================================================================= */

.settings-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 12px;
}

.reset-btn,
.cancel-btn,
.apply-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.reset-btn {
  border: 1px solid #fca5a5;
  background-color: white;
  color: #dc2626;
}

.reset-btn:hover {
  background-color: #fef2f2;
  border-color: #f87171;
}

.cancel-btn {
  border: 1px solid #d1d5db;
  background-color: white;
  color: #374151;
}

.cancel-btn:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.apply-btn {
  border: 1px solid #3b82f6;
  background-color: #3b82f6;
  color: white;
}

.apply-btn:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.apply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* =============================================================================
   🎬 Animations
   ============================================================================= */

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

/* =============================================================================
   📱 Responsive Design
   ============================================================================= */

@media (max-width: 768px) {
  .settings-modal {
    width: 95vw;
    max-height: 95vh;
  }
  
  .settings-header,
  .settings-content,
  .settings-footer {
    padding: 16px;
  }
  
  .settings-tabs {
    padding: 0 16px;
    overflow-x: auto;
  }
  
  .tab-btn {
    padding: 8px 12px;
    font-size: 0.8rem;
    white-space: nowrap;
  }
  
  .setting-control {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .size-options {
    flex-direction: column;
    gap: 8px;
  }
  
  .include-options {
    gap: 12px;
  }
  
  .settings-footer {
    flex-direction: column;
    gap: 12px;
  }
}

/* =============================================================================
   🌙 Dark Mode
   ============================================================================= */

@media (prefers-color-scheme: dark) {
  .settings-modal {
    background-color: #1f2937;
    color: #f9fafb;
  }
  
  .settings-header,
  .settings-footer {
    border-color: #374151;
  }
  
  .settings-title {
    color: #f9fafb;
  }
  
  .settings-tabs {
    background-color: #111827;
    border-color: #374151;
  }
  
  .tab-btn {
    color: #d1d5db;
  }
  
  .tab-btn:hover {
    color: #f3f4f6;
    background-color: #374151;
  }
  
  .tab-btn--active {
    color: #60a5fa;
    background-color: #1f2937;
    border-bottom-color: #60a5fa;
  }
  
  .section-title {
    color: #f9fafb;
    border-color: #374151;
  }
  
  .setting-label,
  .checkbox-label,
  .size-label {
    color: #d1d5db;
  }
  
  .setting-description,
  .filename-variables {
    color: #9ca3af;
  }
  
  .border-select,
  .format-select,
  .delimiter-select,
  .focus-select,
  .number-input,
  .filename-input {
    background-color: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
  
  .checkbox-custom {
    background-color: #374151;
    border-color: #4b5563;
  }
  
  .size-radio {
    border-color: #4b5563;
  }
  
  .cancel-btn,
  .reset-btn {
    background-color: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
}

/* =============================================================================
   ♿ Accessibility Enhancements
   ============================================================================= */

.settings--high-contrast {
  --primary-color: #000000;
  --text-color: #000000;
  --bg-color: #ffffff;
  --border-color: #000000;
}

.settings--reduced-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* Focus indicators */
.tab-btn:focus-visible,
.close-btn:focus-visible,
.checkbox-input:focus-visible + .checkbox-custom,
.size-radio:focus-visible,
.reset-btn:focus-visible,
.cancel-btn:focus-visible,
.apply-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Enhanced keyboard navigation */
.settings--enhanced-keyboard .tab-btn:focus {
  background-color: #dbeafe;
  color: #1d4ed8;
}
</style>