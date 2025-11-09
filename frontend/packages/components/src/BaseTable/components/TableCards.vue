<!--
  @fileoverview TableCards Component
  @description カード表示モードのモバイル対応テーブル
-->

<template>
  <div class="table-cards" :class="cardsClasses">
    <!-- Header -->
    <div v-if="showHeader" class="cards-header">
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

    <!-- Cards Grid -->
    <div class="cards-grid" :style="gridStyle">
      <div
        v-for="(item, index) in data"
        :key="getItemKey(item, index)"
        :class="getCardClasses(item, index)"
        @click="handleCardClick(item, index, $event)"
        @touchstart="handleTouchStart($event, item)"
        @touchmove="handleTouchMove($event, item)"
        @touchend="handleTouchEnd($event, item)"
      >
        <!-- Card Header -->
        <div class="card-header">
          <!-- Selection -->
          <div v-if="selectable" class="card-selection">
            <input
              :id="`card-item-${index}`"
              type="checkbox"
              :checked="isSelected(item)"
              @change="toggleSelection(item)"
              @click.stop
              class="selection-checkbox"
            />
            <label :for="`card-item-${index}`" class="selection-label"></label>
          </div>

          <!-- Primary Info -->
          <div class="card-primary">
            <div v-if="primaryColumn" class="primary-content">
              <MultiItemCell
                :items="primaryColumn.items"
                :data="item"
                :column="primaryColumn"
                :row-index="index"
                :compact="false"
              />
            </div>
          </div>

          <!-- Actions Menu -->
          <div v-if="hasActions" class="card-actions">
            <button
              type="button"
              class="actions-btn"
              @click.stop="toggleActionsMenu(item)"
              :aria-expanded="isActionsOpen(item)"
            >
              ⋮
            </button>
            <div v-if="isActionsOpen(item)" class="actions-menu">
              <slot name="card-actions" :item="item" :index="index"></slot>
            </div>
          </div>
        </div>

        <!-- Card Body -->
        <div class="card-body">
          <!-- Secondary Info -->
          <div v-if="secondaryColumns.length > 0" class="secondary-info">
            <div
              v-for="column in secondaryColumns"
              :key="column.id"
              class="info-item"
            >
              <div class="info-label">{{ column.label }}</div>
              <div class="info-value">
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

          <!-- Tags/Badges -->
          <div v-if="showTags" class="card-tags">
            <slot name="card-tags" :item="item" :index="index">
              <!-- Default tags based on data -->
              <span
                v-for="tag in getItemTags(item)"
                :key="tag.key"
                :class="getTagClasses(tag)"
              >
                {{ tag.label }}
              </span>
            </slot>
          </div>
        </div>

        <!-- Card Footer -->
        <div v-if="showFooter" class="card-footer">
          <!-- Metadata -->
          <div class="card-metadata">
            <slot name="card-metadata" :item="item" :index="index">
              <span v-if="item.createdAt" class="metadata-item">
                {{ formatDate(item.createdAt) }}
              </span>
              <span v-if="item.status" class="metadata-item">
                {{ item.status }}
              </span>
            </slot>
          </div>

          <!-- More Info Button -->
          <button
            v-if="hasHiddenColumns"
            type="button"
            class="more-info-btn"
            @click.stop="toggleExpanded(item)"
            :aria-expanded="isExpanded(item)"
          >
            {{ isExpanded(item) ? '閉じる' : '詳細' }}
          </button>
        </div>

        <!-- Expanded Content -->
        <div v-if="isExpanded(item)" class="card-expanded">
          <div class="expanded-content">
            <div
              v-for="column in hiddenColumns"
              :key="column.id"
              class="expanded-item"
            >
              <div class="expanded-label">{{ column.label }}</div>
              <div class="expanded-value">
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

        <!-- Swipe Indicators -->
        <div v-if="swipeEnabled" class="swipe-indicators">
          <div
            v-if="getSwipeDirection(item) === 'left'"
            class="swipe-left"
            :style="getSwipeStyle(item)"
          >
            <slot name="swipe-left" :item="item">
              <span class="swipe-icon">📌</span>
              <span class="swipe-text">Pin</span>
            </slot>
          </div>
          <div
            v-if="getSwipeDirection(item) === 'right'"
            class="swipe-right"
            :style="getSwipeStyle(item)"
          >
            <slot name="swipe-right" :item="item">
              <span class="swipe-icon">🗑️</span>
              <span class="swipe-text">Delete</span>
            </slot>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="data.length === 0" class="empty-state">
        <slot name="empty">
          <div class="empty-icon">🎴</div>
          <div class="empty-message">データがありません</div>
        </slot>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-message">読み込み中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots } from 'vue'
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
  showTags?: boolean
  swipeEnabled?: boolean
  cardSize?: 'small' | 'medium' | 'large'
  itemKey?: string | ((item: TableItem) => string)
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false,
  selectedItems: () => [],
  loading: false,
  showHeader: true,
  showFooter: true,
  showTags: true,
  swipeEnabled: true,
  cardSize: 'medium',
  itemKey: 'id'
})

const emit = defineEmits<{
  'card-click': [item: TableItem, index: number, event: MouseEvent]
  'selection-change': [selectedItems: TableItem[]]
  'item-swipe': [item: TableItem, direction: 'left' | 'right']
}>()

// =============================================================================
// 📊 Reactive State
// =============================================================================

const slots = useSlots()
const expandedItems = ref<Set<string>>(new Set())
const openActions = ref<Set<string>>(new Set())
const swipeStates = ref<Map<string, {
  startX: number
  startY: number
  currentX: number
  direction: 'left' | 'right' | null
}>>(new Map())

// =============================================================================
// 📊 Computed Properties
// =============================================================================

const cardsClasses = computed(() => [
  'table-cards',
  `cards--${props.cardSize}`,
  {
    'cards--loading': props.loading,
    'cards--selectable': props.selectable,
    'cards--swipe-enabled': props.swipeEnabled
  }
])

const gridStyle = computed(() => {
  const sizes = {
    small: '240px',
    medium: '300px',
    large: '360px'
  }
  
  return {
    gridTemplateColumns: `repeat(auto-fill, minmax(${sizes[props.cardSize]}, 1fr))`
  }
})

const primaryColumn = computed(() => 
  props.columns.find(col => getColumnPriority(col) >= 900) || props.columns[0]
)

const secondaryColumns = computed(() => 
  props.columns
    .filter(col => col.id !== primaryColumn.value?.id)
    .filter((_, index) => index < 4)
    .sort((a, b) => getColumnPriority(b) - getColumnPriority(a))
)

const hasHiddenColumns = computed(() => props.hiddenColumns.length > 0)
const hasActions = computed(() => !!slots['card-actions'])

// =============================================================================
// 🎯 Methods & Utilities
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

const getCardClasses = (item: TableItem, index: number) => [
  'card-item',
  {
    'card--selected': isSelected(item),
    'card--expanded': isExpanded(item),
    'card--actions-open': isActionsOpen(item),
    'card--swiping': getSwipeDirection(item) !== null
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

const isActionsOpen = (item: TableItem): boolean => {
  return openActions.value.has(getItemKey(item, 0))
}

const getSwipeDirection = (item: TableItem): 'left' | 'right' | null => {
  const key = getItemKey(item, 0)
  return swipeStates.value.get(key)?.direction || null
}

// =============================================================================
// 🎯 Event Handlers
// =============================================================================

const handleCardClick = (item: TableItem, index: number, event: MouseEvent) => {
  emit('card-click', item, index, event)
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

const toggleActionsMenu = (item: TableItem) => {
  const key = getItemKey(item, 0)
  const newOpen = new Set(openActions.value)
  
  if (newOpen.has(key)) {
    newOpen.delete(key)
  } else {
    // Close others and open this one
    newOpen.clear()
    newOpen.add(key)
  }
  
  openActions.value = newOpen
}

const getItemTags = (item: TableItem) => {
  const tags: Array<{ key: string; label: string; type?: string }> = []
  
  // Extract tags from item data
  if (item.status) {
    tags.push({ key: 'status', label: item.status, type: 'status' })
  }
  
  if (item.priority) {
    tags.push({ key: 'priority', label: item.priority, type: 'priority' })
  }
  
  if (item.category) {
    tags.push({ key: 'category', label: item.category, type: 'category' })
  }
  
  return tags
}

const getTagClasses = (tag: { type?: string; label: string }) => [
  'card-tag',
  tag.type ? `tag--${tag.type}` : 'tag--default'
]

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

// =============================================================================
// 👆 Touch & Swipe Handlers
// =============================================================================

const handleTouchStart = (event: TouchEvent, item: TableItem) => {
  if (!props.swipeEnabled || event.touches.length !== 1) return

  const touch = event.touches[0]
  const key = getItemKey(item, 0)

  swipeStates.value.set(key, {
    startX: touch.clientX,
    startY: touch.clientY,
    currentX: touch.clientX,
    direction: null
  })
}

const handleTouchMove = (event: TouchEvent, item: TableItem) => {
  if (!props.swipeEnabled || event.touches.length !== 1) return

  const touch = event.touches[0]
  const key = getItemKey(item, 0)
  const swipeState = swipeStates.value.get(key)
  
  if (!swipeState) return

  const deltaX = touch.clientX - swipeState.startX
  const deltaY = touch.clientY - swipeState.startY
  
  // Detect horizontal swipe
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
    swipeState.direction = deltaX > 0 ? 'right' : 'left'
    swipeState.currentX = touch.clientX
    event.preventDefault()
  }
}

const handleTouchEnd = (event: TouchEvent, item: TableItem) => {
  if (!props.swipeEnabled) return

  const key = getItemKey(item, 0)
  const swipeState = swipeStates.value.get(key)
  
  if (!swipeState || !swipeState.direction) {
    swipeStates.value.delete(key)
    return
  }

  const deltaX = swipeState.currentX - swipeState.startX
  const threshold = 80

  if (Math.abs(deltaX) > threshold) {
    emit('item-swipe', item, swipeState.direction)
  }

  swipeStates.value.delete(key)
}

const getSwipeStyle = (item: TableItem) => {
  const key = getItemKey(item, 0)
  const swipeState = swipeStates.value.get(key)
  
  if (!swipeState || !swipeState.direction) return {}

  const deltaX = swipeState.currentX - swipeState.startX
  const opacity = Math.min(Math.abs(deltaX) / 100, 1)
  
  return {
    opacity: opacity.toString()
  }
}
</script>

<style scoped>
/* =============================================================================
   🎨 Cards Layout
   ============================================================================= */

.table-cards {
  position: relative;
  height: 100%;
  background-color: #f8fafc;
}

.cards--loading .cards-grid {
  opacity: 0.6;
  pointer-events: none;
}

/* =============================================================================
   📑 Header
   ============================================================================= */

.cards-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 20;
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

/* =============================================================================
   🎴 Cards Grid
   ============================================================================= */

.cards-grid {
  display: grid;
  gap: 16px;
  padding: 20px;
  min-height: 200px;
}

.cards--small .cards-grid {
  gap: 12px;
  padding: 16px;
}

.cards--large .cards-grid {
  gap: 20px;
  padding: 24px;
}

.card-item {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.card-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-item:active {
  transform: translateY(0);
}

.card--selected {
  border: 2px solid #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.card--swiping {
  transition: none;
}

/* =============================================================================
   📋 Card Header
   ============================================================================= */

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 16px 12px;
}

.card-selection {
  flex-shrink: 0;
  margin-top: 4px;
}

.selection-checkbox {
  display: none;
}

.selection-label {
  display: block;
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

.card-primary {
  flex: 1;
  min-width: 0;
}

.primary-content {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.card-actions {
  position: relative;
  flex-shrink: 0;
}

.actions-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.actions-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 160px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  z-index: 30;
  animation: slideDown 0.2s ease;
}

/* =============================================================================
   📄 Card Body
   ============================================================================= */

.card-body {
  padding: 0 16px 12px;
}

.secondary-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.cards--small .secondary-info {
  grid-template-columns: 1fr;
  gap: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.info-value {
  font-size: 0.875rem;
  color: #334155;
  line-height: 1.4;
}

/* Card Tags */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-tag {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.2;
}

.tag--default {
  background-color: #f1f5f9;
  color: #475569;
}

.tag--status {
  background-color: #dcfce7;
  color: #166534;
}

.tag--priority {
  background-color: #fef3c7;
  color: #92400e;
}

.tag--category {
  background-color: #eff6ff;
  color: #1e40af;
}

/* =============================================================================
   🦶 Card Footer
   ============================================================================= */

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #f1f5f9;
  background-color: #fafbfc;
}

.card-metadata {
  display: flex;
  gap: 12px;
  font-size: 0.75rem;
  color: #64748b;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.more-info-btn {
  padding: 4px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.more-info-btn:hover {
  border-color: #cbd5e1;
  color: #334155;
}

/* =============================================================================
   📖 Expanded Content
   ============================================================================= */

.card-expanded {
  border-top: 1px solid #f1f5f9;
  background-color: #fafbfc;
  animation: slideDown 0.2s ease;
}

.expanded-content {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.cards--small .expanded-content {
  grid-template-columns: 1fr;
  gap: 8px;
}

.expanded-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.expanded-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
}

.expanded-value {
  font-size: 0.875rem;
  color: #334155;
  line-height: 1.4;
}

/* =============================================================================
   👆 Swipe Indicators
   ============================================================================= */

.swipe-indicators {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.swipe-left,
.swipe-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.swipe-left {
  left: 0;
  background: linear-gradient(90deg, #3b82f6, transparent);
}

.swipe-right {
  right: 0;
  background: linear-gradient(270deg, #ef4444, transparent);
}

.swipe-icon {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.swipe-text {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* =============================================================================
   🚫 Empty & Loading States
   ============================================================================= */

.empty-state {
  grid-column: 1 / -1;
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

.loading-overlay {
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
  z-index: 40;
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
   🎬 Animations
   ============================================================================= */

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* =============================================================================
   📱 Mobile Optimizations
   ============================================================================= */

@media (max-width: 640px) {
  .cards-grid {
    grid-template-columns: 1fr !important;
    gap: 12px;
    padding: 12px;
  }
  
  .card-header {
    padding: 12px 12px 8px;
  }
  
  .card-body {
    padding: 0 12px 8px;
  }
  
  .card-footer {
    padding: 8px 12px;
  }
  
  .secondary-info {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .expanded-content {
    grid-template-columns: 1fr;
    padding: 12px;
  }
}

/* =============================================================================
   🌙 Dark Mode
   ============================================================================= */

@media (prefers-color-scheme: dark) {
  .table-cards {
    background-color: #0f172a;
  }
  
  .cards-header,
  .card-item {
    background-color: #1e293b;
    border-color: #334155;
  }
  
  .card--selected {
    border-color: #60a5fa;
  }
  
  .card-footer {
    background-color: #0f172a;
    border-color: #334155;
  }
  
  .card-expanded {
    background-color: #0f172a;
    border-color: #334155;
  }
  
  .primary-content {
    color: #f1f5f9;
  }
  
  .info-value,
  .expanded-value {
    color: #cbd5e1;
  }
  
  .info-label,
  .expanded-label {
    color: #94a3b8;
  }
  
  .item-count {
    color: #cbd5e1;
  }
  
  .actions-btn:hover {
    background-color: #334155;
    color: #cbd5e1;
  }
  
  .actions-menu {
    background-color: #1e293b;
    border-color: #334155;
  }
  
  .more-info-btn {
    background-color: #334155;
    border-color: #475569;
    color: #94a3b8;
  }
  
  .selection-label {
    background-color: #334155;
    border-color: #475569;
  }
  
  .card-tag {
    background-color: #334155;
    color: #cbd5e1;
  }
  
  .loading-overlay {
    background-color: rgba(15, 23, 42, 0.8);
  }
}
</style>