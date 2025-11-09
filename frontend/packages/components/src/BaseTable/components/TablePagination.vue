<!--
  @fileoverview TablePagination Component
  @description 高機能ページネーション（ページサイズ変更、ジャンプ、情報表示）
-->

<template>
  <div 
    v-if="config.enabled && totalItems > 0"
    :class="paginationClasses"
    role="navigation"
    :aria-label="paginationAriaLabel"
  >
    <!-- Left Section: Total Info -->
    <div v-if="config.showTotal" class="pagination-info">
      <span class="info-text">
        {{ totalInfoText }}
      </span>
      <span v-if="selectedItems > 0" class="selected-info">
        ({{ selectedItems }}件選択中)
      </span>
    </div>

    <!-- Center Section: Page Controls -->
    <div class="pagination-controls">
      <!-- First Page -->
      <button
        type="button"
        class="page-btn page-btn--first"
        :disabled="currentPage <= 1"
        @click="goToPage(1)"
        :aria-label="'最初のページ'"
        title="最初のページ"
      >
        ⏮
      </button>

      <!-- Previous Page -->
      <button
        type="button"
        class="page-btn page-btn--prev"
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
        :aria-label="'前のページ'"
        title="前のページ"
      >
        ◀
      </button>

      <!-- Page Numbers -->
      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          :class="getPageButtonClasses(page)"
          @click="goToPage(page)"
          :aria-label="`ページ ${page}`"
          :aria-current="page === currentPage ? 'page' : undefined"
          :disabled="page === '...'"
        >
          {{ page }}
        </button>
      </div>

      <!-- Next Page -->
      <button
        type="button"
        class="page-btn page-btn--next"
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
        :aria-label="'次のページ'"
        title="次のページ"
      >
        ▶
      </button>

      <!-- Last Page -->
      <button
        type="button"
        class="page-btn page-btn--last"
        :disabled="currentPage >= totalPages"
        @click="goToPage(totalPages)"
        :aria-label="'最後のページ'"
        title="最後のページ"
      >
        ⏭
      </button>
    </div>

    <!-- Right Section: Page Size & Jump -->
    <div class="pagination-options">
      <!-- Page Size Selector -->
      <div v-if="config.showSizeChanger" class="page-size-selector">
        <label for="page-size-select" class="size-label">表示件数:</label>
        <select
          id="page-size-select"
          :value="pageSize"
          @change="handlePageSizeChange"
          class="size-select"
          :aria-label="'1ページの表示件数を選択'"
        >
          <option
            v-for="size in config.pageSizeOptions"
            :key="size"
            :value="size"
          >
            {{ size }}件
          </option>
        </select>
      </div>

      <!-- Page Jump -->
      <div v-if="config.showQuickJumper && totalPages > 1" class="page-jumper">
        <label for="page-jump-input" class="jump-label">ページ:</label>
        <input
          id="page-jump-input"
          v-model.number="jumpPage"
          type="number"
          :min="1"
          :max="totalPages"
          class="jump-input"
          @keydown.enter="handlePageJump"
          @blur="handlePageJump"
          :aria-label="'ページ番号を入力してジャンプ'"
        />
        <button
          type="button"
          class="jump-btn"
          @click="handlePageJump"
          :disabled="!isValidJumpPage"
          :aria-label="'入力したページにジャンプ'"
          title="ジャンプ"
        >
          GO
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PaginationConfig } from '../types'

export interface Props {
  config: PaginationConfig
  currentPage: number
  pageSize: number
  totalItems: number
  selectedItems?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedItems: 0,
  loading: false
})

const emit = defineEmits<{
  'page-changed': [page: number]
  'page-size-changed': [pageSize: number]
}>()

// =============================================================================
// 📊 Reactive State
// =============================================================================

const jumpPage = ref(props.currentPage)

// =============================================================================
// 📊 Computed Properties
// =============================================================================

const totalPages = computed(() => 
  Math.ceil(props.totalItems / props.pageSize)
)

const startItem = computed(() => 
  (props.currentPage - 1) * props.pageSize + 1
)

const endItem = computed(() => 
  Math.min(props.currentPage * props.pageSize, props.totalItems)
)

const paginationClasses = computed(() => [
  'table-pagination',
  `pagination--${props.config.position}`,
  {
    'pagination--loading': props.loading,
    'pagination--single-page': totalPages.value <= 1
  }
])

const totalInfoText = computed(() => {
  if (props.totalItems === 0) {
    return '0件'
  }
  
  if (totalPages.value === 1) {
    return `全${props.totalItems}件`
  }
  
  return `${startItem.value}～${endItem.value}件 / 全${props.totalItems}件`
})

const paginationAriaLabel = computed(() => 
  `ページネーション: ${props.currentPage}ページ / ${totalPages.value}ページ`
)

const isValidJumpPage = computed(() => 
  jumpPage.value >= 1 && 
  jumpPage.value <= totalPages.value && 
  jumpPage.value !== props.currentPage
)

// Page number generation with ellipsis
const visiblePages = computed(() => {
  const current = props.currentPage
  const total = totalPages.value
  const maxShow = props.config.maxPagesToShow || 5
  
  if (total <= maxShow) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  
  const pages: (number | string)[] = []
  const halfShow = Math.floor(maxShow / 2)
  
  let start = Math.max(current - halfShow, 1)
  let end = Math.min(start + maxShow - 1, total)
  
  // Adjust start if we're near the end
  if (end - start + 1 < maxShow) {
    start = Math.max(end - maxShow + 1, 1)
  }
  
  // Add first page and ellipsis if needed
  if (start > 1) {
    pages.push(1)
    if (start > 2) {
      pages.push('...')
    }
  }
  
  // Add main pages
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  // Add ellipsis and last page if needed
  if (end < total) {
    if (end < total - 1) {
      pages.push('...')
    }
    pages.push(total)
  }
  
  return pages
})

// =============================================================================
// 🎯 Event Handlers & Methods
// =============================================================================

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-changed', page)
  }
}

const handlePageSizeChange = (event: Event) => {
  const newSize = Number((event.target as HTMLSelectElement).value)
  emit('page-size-changed', newSize)
}

const handlePageJump = () => {
  if (isValidJumpPage.value) {
    goToPage(jumpPage.value)
  } else {
    // Reset to current page if invalid
    jumpPage.value = props.currentPage
  }
}

const getPageButtonClasses = (page: number | string) => [
  'page-btn',
  'page-btn--number',
  {
    'page-btn--current': page === props.currentPage,
    'page-btn--ellipsis': page === '...',
    'page-btn--disabled': page === '...'
  }
]

// =============================================================================
// 🔄 Watchers
// =============================================================================

watch(
  () => props.currentPage,
  (newPage) => {
    jumpPage.value = newPage
  }
)

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.config.enabled) return
  
  switch (event.key) {
    case 'ArrowLeft':
      if (props.currentPage > 1) {
        event.preventDefault()
        goToPage(props.currentPage - 1)
      }
      break
    case 'ArrowRight':
      if (props.currentPage < totalPages.value) {
        event.preventDefault()
        goToPage(props.currentPage + 1)
      }
      break
    case 'Home':
      if (props.currentPage !== 1) {
        event.preventDefault()
        goToPage(1)
      }
      break
    case 'End':
      if (props.currentPage !== totalPages.value) {
        event.preventDefault()
        goToPage(totalPages.value)
      }
      break
  }
}

// Add keyboard listeners when component mounts
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<style scoped>
/* =============================================================================
   🎨 Pagination Layout
   ============================================================================= */

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background-color: white;
  border-top: 1px solid #e5e7eb;
  min-height: 60px;
  font-size: 0.875rem;
}

.pagination--loading {
  opacity: 0.6;
  pointer-events: none;
}

.pagination--single-page {
  justify-content: flex-start;
}

.pagination--top {
  border-top: none;
  border-bottom: 1px solid #e5e7eb;
}

/* =============================================================================
   📊 Pagination Info
   ============================================================================= */

.pagination-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-weight: 500;
}

.info-text {
  color: #374151;
  font-weight: 600;
}

.selected-info {
  color: #2563eb;
  font-weight: 500;
  font-size: 0.75rem;
}

/* =============================================================================
   🎛️ Pagination Controls
   ============================================================================= */

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s ease;
  user-select: none;
}

.page-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
  background-color: #f8fafc;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f9fafb;
}

.page-btn--current {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.page-btn--current:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}

.page-btn--ellipsis {
  border: none;
  background: transparent;
  cursor: default;
  pointer-events: none;
}

.page-btn--first,
.page-btn--last {
  font-size: 0.75rem;
}

.page-btn--prev,
.page-btn--next {
  font-size: 0.875rem;
}

.page-numbers {
  display: flex;
  gap: 2px;
  margin: 0 8px;
}

/* =============================================================================
   ⚙️ Pagination Options
   ============================================================================= */

.pagination-options {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Page Size Selector */
.page-size-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
}

.size-label {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

.size-select {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.size-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

/* Page Jumper */
.page-jumper {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
}

.jump-label {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

.jump-input {
  width: 60px;
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  text-align: center;
  font-size: 0.875rem;
  color: #374151;
  transition: border-color 0.15s ease;
}

.jump-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.jump-btn {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  color: #374151;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.jump-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
  background-color: #f8fafc;
}

.jump-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* =============================================================================
   📱 Responsive Design
   ============================================================================= */

@media (max-width: 768px) {
  .table-pagination {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
  }
  
  .pagination-info {
    order: 1;
    justify-content: center;
  }
  
  .pagination-controls {
    order: 2;
    justify-content: center;
  }
  
  .pagination-options {
    order: 3;
    justify-content: space-between;
  }
  
  .page-numbers {
    margin: 0 4px;
  }
  
  .page-btn {
    min-width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .pagination-options {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .page-size-selector,
  .page-jumper {
    justify-content: space-between;
  }
  
  .page-numbers {
    gap: 1px;
  }
  
  .page-btn {
    min-width: 24px;
    height: 24px;
    padding: 0 4px;
    font-size: 0.75rem;
  }
  
  /* Hide first/last buttons on very small screens */
  .page-btn--first,
  .page-btn--last {
    display: none;
  }
}

/* =============================================================================
   🌙 Dark Mode
   ============================================================================= */

@media (prefers-color-scheme: dark) {
  .table-pagination {
    background-color: #1f2937;
    border-top-color: #374151;
    color: #f9fafb;
  }
  
  .pagination-info {
    color: #d1d5db;
  }
  
  .info-text {
    color: #f3f4f6;
  }
  
  .selected-info {
    color: #60a5fa;
  }
  
  .page-btn {
    background-color: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
  
  .page-btn:hover:not(:disabled) {
    border-color: #60a5fa;
    color: #60a5fa;
    background-color: #1f2937;
  }
  
  .page-btn:disabled {
    background-color: #2d3748;
    color: #6b7280;
  }
  
  .page-btn--current {
    background-color: #3b82f6;
    border-color: #3b82f6;
    color: white;
  }
  
  .size-select,
  .jump-input,
  .jump-btn {
    background-color: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
  
  .size-select:focus,
  .jump-input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 1px #60a5fa;
  }
  
  .jump-btn:hover:not(:disabled) {
    border-color: #60a5fa;
    color: #60a5fa;
    background-color: #1f2937;
  }
}

/* =============================================================================
   ♿ Accessibility Enhancements
   ============================================================================= */

/* Focus indicators */
.page-btn:focus-visible,
.size-select:focus-visible,
.jump-input:focus-visible,
.jump-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .page-btn {
    border-width: 2px;
  }
  
  .page-btn--current {
    border-color: #000;
    background-color: #000;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .page-btn,
  .size-select,
  .jump-input,
  .jump-btn {
    transition: none;
  }
}
</style>