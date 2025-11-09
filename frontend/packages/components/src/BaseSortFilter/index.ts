// BaseSortFilter パッケージのエクスポート

// 型定義をエクスポート
export type {
  SortConfig,
  FilterConfig,
  SortFilterConfig,
  SortProps,
  FilterProps,
  SortFilterProps,
  SortEmits,
  FilterEmits,
  SortFilterEmits,
  FilterOperator
} from './types'

// 型定義をインポート（関数で使用するため）
import type { SortConfig, FilterConfig, SortFilterConfig } from './types'

// コンポーネントをエクスポート
export { default as BaseSort } from './components/BaseSort.vue'
export { default as BaseFilter } from './components/BaseFilter.vue'
export { default as BaseSortFilter } from './components/BaseSortFilter.vue'

// UIコンポーネントもエクスポート
export { default as SortIcon } from './components/SortIcon.vue'
export { default as FilterIcon } from './components/FilterIcon.vue'
export { default as FilterButton } from './components/FilterButton.vue'
export { default as FilterDialog } from './components/FilterDialog.vue'
export { default as CloseIcon } from './components/CloseIcon.vue'

// 便利関数をエクスポート
export const createSortConfig = (
  key: string,
  options?: Partial<SortConfig>
): SortConfig => ({
  key,
  direction: null,
  label: key,
  type: 'text',
  ...options
})

export const createFilterConfig = (
  key: string,
  type: FilterConfig['type'],
  operator: FilterConfig['operator'] = 'equals',
  options?: Partial<FilterConfig>
): FilterConfig => ({
  key,
  type,
  operator,
  value: null,
  enabled: false,
  label: key,
  ...options
})

export const createSortFilterConfig = (
  sorts: SortConfig[] = [],
  filters: FilterConfig[] = [],
  options?: Partial<SortFilterConfig>
): SortFilterConfig => ({
  sorts,
  filters,
  multiSort: false,
  multiFilter: true,
  filterLogic: 'AND',
  ...options
})