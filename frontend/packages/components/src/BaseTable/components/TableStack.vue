<!--
  @fileoverview TableStack Component
  @description スタック表示モード（縦並び）のモバイル対応テーブル
-->

<template>
  <div class="table-stack" :class="stackClasses">
    <!-- Header -->
    <div v-if="showHeader" class="stack-header">
      <div class="header-info">
        <span class="item-count">{{ data.length }}件</span>
        <span v-if="selectedItems.length > 0" class="selected-count">
          ({{ selectedItems.length }}件選択)
        </span>
      </div>
      <div class="header-actions">
        <slot name="header-actions"></slot>
      </div>
    </div>

    <!-- Stack Items -->
    <div class="stack-items">
      <div
        v-for="(item, index) in data"
        :key="getItemKey(item, index)"
        :class="getItemClasses(item, index)"
        @click="handleItemClick(item, index, $event)"
        @touchstart="handleTouchStart($event)"
        @touchmove="handleTouchMove($event)"
        @touchend="handleTouchEnd($event)"
      >
        <!-- Selection Checkbox -->
        <div v-if="selectable" class="item-selection">
          <input
            :id="`stack-item-${index}`"
            type="checkbox"
            :checked="isSelected(item)"
            @change="toggleSelection(item)"
            @click.stop
            class="selection-checkbox"
          />
          <label :for="`stack-item-${index}`" class="selection-label"></label>
        </div>

        <!-- Item Content -->
        <div class="item-content">
          <!-- Primary Column (Most Important) -->
          <div v-if="primaryColumn" class="primary-section">
            <div class="primary-label">{{ primaryColumn.label }}</div>
            <div class="primary-value">
              <MultiItemCell
                :items="primaryColumn.items"
                :data="item"
                :column="primaryColumn"
                :row-index="index"
                :compact="true"
              />
            </div>
          </div>

          <!-- Secondary Columns -->
          <div class="secondary-sections">
            <div
              v-for="column in secondaryColumns"
              :key="column.id"
              class="secondary-section"
            >
              <div class="secondary-label">{{ column.label }}</div>
              <div class="secondary-value">
                <MultiItemCell
                  :items="column.items"
                  :data="item"
                  :column="column"
                  :row-index="index"
                  :compact="true"
                />
              </div>
            </div>
          </div>

          <!-- Expandable Section -->
          <div v-if="hasHiddenColumns" class="expandable-section">
            <button
              type="button"
              class="expand-btn"
              @click.stop="toggleExpanded(item)"
              :aria-expanded="isExpanded(item)"
            >
              {{ isExpanded(item) ? '詳細を非表示' : '詳細を表示' }}
              <span class="expand-icon">
                {{ isExpanded(item) ? '🔼' : '🔽' }}
              </span>
            </button>

            <!-- Hidden Columns -->
            <div v-if="isExpanded(item)" class="hidden-columns">
              <div
                v-for="column in hiddenColumns"
                :key="column.id"
                class="hidden-section"
              >
                <div class="hidden-label">{{ column.label }}</div>
                <div class="hidden-value">
                  <MultiItemCell
                    :items="column.items"
                    :data="item"
                    :column="column"
                    :row-index="index"
                    :compact="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Item Actions -->
        <div v-if="hasActions" class="item-actions">
          <slot name="item-actions" :item="item" :index="index"></slot>
        </div>

        <!-- Swipe Indicator -->
        <div v-if="swipeEnabled" class="swipe-indicator" :style="getSwipeStyle(item)">
          <div class="swipe-action">
            <slot name="swipe-action" :item="item" :index="index">
              <span class="swipe-icon">⚡</span>
            </slot>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="data.length === 0" class="empty-state">
        <slot name="empty">
          <div class="empty-icon">📋</div>
          <div class="empty-message">データがありません</div>
        </slot>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-message">読み込み中...</div>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="showFooter" class="stack-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useSlots } from 'vue'
import MultiItemCell from './MultiItemCell.vue'
import type { TableColumn, TableItem } from '../types'

export interface Props {
  data: TableItem[]
  columns: TableColumn[]
  hiddenColumns: TableColumn[]
  selectable?: boolean
  selectedItems?: TableItem[]
  loading?: boolean
  showHeader?: boolean
  showFooter?: boolean
  swipeEnabled?: boolean
  itemKey?: string | ((item: TableItem) => string)
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false,
  selectedItems: () => [],
  loading: false,
  showHeader: true,
  showFooter: false,
  swipeEnabled: true,
  itemKey: 'id'
})

const emit = defineEmits<{
  'item-click': [item: TableItem, index: number, event: MouseEvent]
  'selection-change': [selectedItems: TableItem[]]
  'item-swipe': [item: TableItem, direction: 'left' | 'right']
}>()

// =============================================================================
// 📊 Reactive State
// =============================================================================

const slots = useSlots()
const expandedItems = ref<Set<string>>(new Set())
const swipeStates = ref<Map<string, { startX: number; currentX: number }>>(new Map())

// =============================================================================
// 📊 Computed Properties
// =============================================================================

const stackClasses = computed(() => [
  'table-stack',
  {
    'stack--loading': props.loading,
    'stack--selectable': props.selectable,
    'stack--swipe-enabled': props.swipeEnabled
  }
])

// カラムの優先度に基づく分類
const primaryColumn = computed(() => 
  props.columns.find(col => getColumnPriority(col) >= 900) || props.columns[0]
)

const secondaryColumns = computed(() => 
  props.columns
    .filter(col => col.id !== primaryColumn.value?.id)
    .filter((_, index) => index < 3) // 最大3つの副カラム
    .sort((a, b) => getColumnPriority(b) - getColumnPriority(a))
)

const hasHiddenColumns = computed(() => props.hiddenColumns.length > 0)
const hasActions = computed(() => !!slots['item-actions'])

// =============================================================================
// 🎯 Event Handlers & Methods
// =============================================================================

const getItemKey = (item: TableItem, index: number): string => {
  if (typeof props.itemKey === 'function') {
    return props.itemKey(item)
  }
  return String(item[props.itemKey] || index)
}

const getColumnPriority = (column: TableColumn): number => {
  const hasRequired = column.items.some(item => item.required)
  if (hasRequired) return 1000

  const explicitPriority = column.items.reduce((max, item) => {
    const priority = item.priority === 'high' ? 900 : 
                    item.priority === 'medium' ? 500 : 100
    return Math.max(max, priority)
  }, 0)

  return explicitPriority || column.items.length * 50
}

const getItemClasses = (item: TableItem, index: number) => [
  'stack-item',
  {
    'item--selected': isSelected(item),
    'item--expanded': isExpanded(item),
    'item--even': index % 2 === 0,
    'item--odd': index % 2 === 1
  }
]

const isSelected = (item: TableItem): boolean => {
  return props.selectedItems.some(selected => 
    getItemKey(selected, 0) === getItemKey(item, 0)
  )
}

const isExpanded = (item: TableItem): boolean => {
  return expandedItems.value.has(getItemKey(item, 0))
}

const handleItemClick = (item: TableItem, index: number, event: MouseEvent) => {
  emit('item-click', item, index, event)
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

const toggleExpanded = (item: TableItem) => {
  const key = getItemKey(item, 0)
  const newExpanded = new Set(expandedItems.value)
  
  if (newExpanded.has(key)) {
    newExpanded.delete(key)
  } else {
    newExpanded.add(key)
  }
  
  expandedItems.value = newExpanded
}

// =============================================================================
// 👆 Touch & Swipe Handlers
// =============================================================================

const handleTouchStart = (event: TouchEvent) => {
  if (!props.swipeEnabled || event.touches.length !== 1) return

  const touch = event.touches[0]
  const target = (event.currentTarget as HTMLElement).dataset.itemKey
  if (!target) return

  swipeStates.value.set(target, {
    startX: touch.clientX,
    currentX: touch.clientX
  })
}

const handleTouchMove = (event: TouchEvent) => {
  if (!props.swipeEnabled || event.touches.length !== 1) return

  const touch = event.touches[0]
  const target = (event.currentTarget as HTMLElement).dataset.itemKey
  const swipeState = swipeStates.value.get(target || '')
  
  if (!swipeState) return

  swipeState.currentX = touch.clientX
  
  // Prevent default scrolling if horizontal swipe detected
  const deltaX = Math.abs(touch.clientX - swipeState.startX)
  const deltaY = Math.abs(touch.clientY - swipeState.startX)
  
  if (deltaX > deltaY) {
    event.preventDefault()
  }
}

const handleTouchEnd = (event: TouchEvent) => {
  if (!props.swipeEnabled) return

  const target = (event.currentTarget as HTMLElement).dataset.itemKey
  const swipeState = swipeStates.value.get(target || '')
  
  if (!swipeState) return

  const deltaX = swipeState.currentX - swipeState.startX
  const threshold = 50 // スワイプ判定の閾値

  if (Math.abs(deltaX) > threshold) {
    const direction = deltaX > 0 ? 'right' : 'left'
    const itemIndex = parseInt((event.currentTarget as HTMLElement).dataset.index || '0')
    const item = props.data[itemIndex]
    
    if (item) {
      emit('item-swipe', item, direction)
    }
  }

  swipeStates.value.delete(target || '')
}

const getSwipeStyle = (item: TableItem) => {
  const key = getItemKey(item, 0)
  const swipeState = swipeStates.value.get(key)
  
  if (!swipeState) return {}

  const deltaX = swipeState.currentX - swipeState.startX
  const opacity = Math.min(Math.abs(deltaX) / 100, 1)
  
  return {
    transform: `translateX(${deltaX}px)`,
    opacity
  }
}
</script>

<style scoped>
/* =============================================================================
   🎨 Stack Layout
   ============================================================================= */

.table-stack {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f8fafc;
}

.stack--loading {
  opacity: 0.6;
}

/* =============================================================================
   📑 Header & Footer
   ============================================================================= */

.stack-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-info {
  display: flex;
  gap: 8px;
  font-size: 0.875rem;
  color: #64748b;
}

.item-count {
  font-weight: 600;
  color: #334155;
}

.selected-count {
  color: #3b82f6;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.stack-footer {
  padding: 12px 16px;
  background-color: white;
  border-top: 1px solid #e2e8f0;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

/* =============================================================================
   📋 Stack Items
   ============================================================================= */

.stack-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.stack-item {
  display: flex;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
}

.stack-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.stack-item:active {
  transform: translateY(0);
}

.item--selected {
  border: 2px solid #3b82f6;
  background-color: #eff6ff;
}

.item--expanded .expand-icon {
  transform: rotate(180deg);
}

/* =============================================================================
   ☑️ Selection
   ============================================================================= */

.item-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  background-color: #f8fafc;
  border-right: 1px solid #e2e8f0;
}

.selection-checkbox {
  display: none;
}

.selection-label {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
}

.selection-checkbox:checked + .selection-label {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.selection-checkbox:checked + .selection-label::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

/* =============================================================================
   📄 Item Content
   ============================================================================= */

.item-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Primary Section */
.primary-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.primary-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.primary-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

/* Secondary Sections */
.secondary-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.secondary-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.secondary-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
}

.secondary-value {
  font-size: 0.875rem;
  color: #334155;
  line-height: 1.4;
}

/* =============================================================================
   📖 Expandable Section
   ============================================================================= */

.expandable-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 0;
  border: none;
  background: transparent;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease;
}

.expand-btn:hover {
  color: #2563eb;
}

.expand-icon {
  transition: transform 0.2s ease;
  font-size: 0.75rem;
}

.hidden-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.hidden-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hidden-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
}

.hidden-value {
  font-size: 0.875rem;
  color: #334155;
  line-height: 1.4;
}

/* =============================================================================
   ⚡ Item Actions
   ============================================================================= */

.item-actions {
  display: flex;
  align-items: center;
  padding: 16px 12px;
  background-color: #f8fafc;
  border-left: 1px solid #e2e8f0;
}

/* =============================================================================
   👆 Swipe Indicator
   ============================================================================= */

.swipe-indicator {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 60px;
  background: linear-gradient(90deg, transparent, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.swipe-action {
  color: white;
  font-size: 1.25rem;
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
  font-size: 3rem;
  margin-bottom: 12px;
}

.empty-message {
  font-size: 1rem;
  font-weight: 500;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748b;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.loading-message {
  font-size: 0.875rem;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* =============================================================================
   📱 Mobile Optimizations
   ============================================================================= */

@media (max-width: 640px) {
  .stack-items {
    padding: 4px;
  }
  
  .stack-item {
    margin-bottom: 6px;
  }
  
  .item-content {
    padding: 12px;
    gap: 10px;
  }
  
  .secondary-sections {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .hidden-columns {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .primary-value {
    font-size: 1rem;
  }
}

/* =============================================================================
   🌙 Dark Mode
   ============================================================================= */

@media (prefers-color-scheme: dark) {
  .table-stack {
    background-color: #0f172a;
  }
  
  .stack-header,
  .stack-footer,
  .stack-item {
    background-color: #1e293b;
    border-color: #334155;
  }
  
  .item--selected {
    background-color: #1e3a8a;
    border-color: #60a5fa;
  }
  
  .item-selection {
    background-color: #0f172a;
    border-color: #334155;
  }
  
  .selection-label {
    background-color: #1e293b;
    border-color: #475569;
  }
  
  .item-actions {
    background-color: #0f172a;
    border-color: #334155;
  }
  
  .primary-value {
    color: #f1f5f9;
  }
  
  .secondary-value,
  .hidden-value {
    color: #cbd5e1;
  }
  
  .primary-label,
  .secondary-label,
  .hidden-label {
    color: #94a3b8;
  }
  
  .item-count {
    color: #cbd5e1;
  }
  
  .expandable-section {
    border-color: #334155;
  }
  
  .hidden-columns {
    border-color: #1e293b;
  }
}
</style>