/**
 * @fileoverview useTableConfig Composable
 * @description テーブル設定の包括的管理（カラム、表示、動作設定）
 * 🔧 高機能設定管理：動的カラム、プリセット、永続化、検証
 */

import { ref, reactive, computed, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type {
  TableConfig,
  TableColumn,
  ColumnWidth,
  PaginationConfig,
  ResponsiveConfig,
  AppearanceConfig,
  BehaviorConfig,
  BreakpointKey,
  ResponsiveValue
} from '../types'

// =============================================================================
// 🎯 Interface Definitions
// =============================================================================

export interface UseTableConfigOptions {
  persist?: boolean                        // 設定の永続化
  persistKey?: string                      // 永続化キー
  validateConfig?: (config: TableConfig) => boolean  // 設定検証
  autoSave?: boolean                       // 自動保存
  responsive?: boolean                     // レスポンシブ自動調整
  presets?: Record<string, Partial<TableConfig>>  // 初期プリセット
}

export interface UseTableConfigReturn {
  // 🔄 Reactive State
  config: Ref<TableConfig>
  columns: Ref<TableColumn[]>
  
  // 📊 Computed Properties
  computed: {
    visibleColumns: ComputedRef<TableColumn[]>
    columnCount: ComputedRef<number>
    totalWidth: ComputedRef<number>
    isResponsive: ComputedRef<boolean>
    currentBreakpoint: ComputedRef<BreakpointKey>
    responsiveColumns: ComputedRef<TableColumn[]>
  }
  
  // ⚡ Actions
  actions: {
    // Configuration Management
    updateConfig: (newConfig: Partial<TableConfig>) => void
    resetConfig: () => void
    loadConfig: (configData: Partial<TableConfig>) => void
    
    // Column Management
    addColumn: (column: TableColumn, index?: number) => void
    removeColumn: (columnId: string) => void
    reorderColumns: (fromIndex: number, toIndex: number) => void
    updateColumn: (columnId: string, updates: Partial<TableColumn>) => void
    duplicateColumn: (columnId: string) => void
    toggleColumnVisibility: (columnId: string) => void
    resizeColumn: (columnId: string, width: ColumnWidth) => void
    
    // Preset Management
    savePreset: (name: string, config?: Partial<TableConfig>) => void
    loadPreset: (name: string) => void
    deletePreset: (name: string) => void
    listPresets: () => string[]
    
    // Responsive Management
    updateBreakpoint: (breakpoint: BreakpointKey) => void
    getColumnVisibilityForBreakpoint: (breakpoint: BreakpointKey) => Record<string, boolean>
    optimizeForDevice: (deviceType: 'mobile' | 'tablet' | 'desktop') => void
    
    // Validation & Utils
    validateConfiguration: () => { valid: boolean; errors: string[] }
    exportConfig: () => string
    importConfig: (configJson: string) => boolean
  }
}

// =============================================================================
// 🏗️ Default Configurations
// =============================================================================

const createDefaultPaginationConfig = (): PaginationConfig => ({
  enabled: true,
  pageSize: 50,
  pageSizeOptions: [10, 25, 50, 100],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: true,
  position: 'bottom',
  maxPagesToShow: 5,
  layout: ['total', 'sizes', 'prev', 'pager', 'next', 'jumper']
})

const createDefaultResponsiveConfig = (): ResponsiveConfig => ({
  enabled: true,
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600
  },
  mobileMode: 'stack',
  hideColumns: [],
  stackOrder: 'priority',
  cardTemplate: 'default'
})

const createDefaultAppearanceConfig = (): AppearanceConfig => ({
  size: 'default',
  bordered: true,
  striped: false,
  hoverable: true,
  theme: 'auto',
  density: 'default',
  borderRadius: 4,
  cellPadding: [8, 12],
  headerStyle: 'default',
  zebraStripe: false,
  shadowLevel: 1
})

const createDefaultBehaviorConfig = (): BehaviorConfig => ({
  selectable: false,
  multiSelect: false,
  expandable: false,
  editable: false,
  draggable: false,
  clickAction: 'none',
  doubleClickAction: 'none',
  keyboardNavigation: true,
  autoSave: true,
  confirmDelete: true,
  rowHeight: 'auto',
  loadingState: false
})

const createDefaultTableConfig = (): TableConfig => ({
  columns: [],
  pagination: createDefaultPaginationConfig(),
  virtual: {
    enabled: false,
    itemHeight: 48,
    overscan: 5,
    threshold: 1000,
    dynamicHeight: false,
    estimatedItemHeight: 48
  },
  responsive: createDefaultResponsiveConfig(),
  appearance: createDefaultAppearanceConfig(),
  behavior: createDefaultBehaviorConfig(),
  presets: {},
  validation: {
    enabled: true,
    validateOnEdit: true,
    validateOnSave: true,
    showValidationErrors: true,
    validationRules: {}
  },
  accessibility: {
    enabled: true,
    announceChanges: true,
    keyboardNavigation: true,
    screenReaderSupport: true,
    ariaLabels: {}
  },
  performance: {
    debounceMs: 300,
    throttleMs: 100,
    memoizeResults: true,
    lazyLoading: true,
    chunkSize: 100,
    maxRenderItems: 1000
  }
})

// =============================================================================
// 🔧 Configuration Utilities
// =============================================================================

const getCurrentBreakpoint = (): BreakpointKey => {
  const width = window.innerWidth
  if (width < 576) return 'xs'
  if (width < 768) return 'sm'
  if (width < 992) return 'md'
  if (width < 1200) return 'lg'
  if (width < 1600) return 'xl'
  return 'xxl'
}

const calculateTotalWidth = (columns: TableColumn[]): number => {
  return columns.reduce((total, column) => {
    if (!column.visible) return total
    
    const width = column.width
    switch (width.type) {
      case 'fixed':
        return total + (width.value || 150)
      case 'percentage':
        return total + (width.value || 10) // This is an approximation
      case 'minmax':
        return total + (width.min || 150)
      default:
        return total + 150 // default width
    }
  }, 0)
}

const shouldColumnBeVisible = (
  column: TableColumn,
  breakpoint: BreakpointKey,
  responsiveConfig: ResponsiveConfig
): boolean => {
  if (!responsiveConfig.enabled) return column.visible
  
  // Check if column is explicitly hidden for this breakpoint
  if (column.hideOn?.includes(breakpoint)) return false
  
  // Check if column is only visible on specific breakpoints
  if (column.showOnlyOn && !column.showOnlyOn.includes(breakpoint)) return false
  
  return column.visible
}

// =============================================================================
// 💾 Persistence Utilities
// =============================================================================

const STORAGE_PREFIX = 'table_config_'

const saveToStorage = (key: string, config: TableConfig): void => {
  try {
    const serializedConfig = JSON.stringify(config)
    localStorage.setItem(STORAGE_PREFIX + key, serializedConfig)
  } catch (error) {
    console.warn('設定の保存に失敗しました:', error)
  }
}

const loadFromStorage = (key: string): Partial<TableConfig> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.warn('設定の読み込みに失敗しました:', error)
    return null
  }
}

const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key)
  } catch (error) {
    console.warn('設定の削除に失敗しました:', error)
  }
}

// =============================================================================
// 🚀 Main Composable
// =============================================================================

export function useTableConfig(
  initialConfig?: Partial<TableConfig>,
  options: UseTableConfigOptions = {}
): UseTableConfigReturn {

  const {
    persist = false,
    persistKey = 'default',
    validateConfig,
    autoSave = false,
    responsive = true,
    presets = {}
  } = options

  // =============================================================================
  // 📊 Reactive State
  // =============================================================================

  // Load initial config with fallbacks
  let baseConfig = createDefaultTableConfig()
  
  // Apply stored config if persistence is enabled
  if (persist) {
    const storedConfig = loadFromStorage(persistKey)
    if (storedConfig) {
      baseConfig = { ...baseConfig, ...storedConfig }
    }
  }
  
  // Apply initial config
  if (initialConfig) {
    baseConfig = { ...baseConfig, ...initialConfig }
  }

  const config = ref<TableConfig>(baseConfig)
  const columns = ref<TableColumn[]>(baseConfig.columns || [])
  const currentBreakpoint = ref<BreakpointKey>(getCurrentBreakpoint())

  // Presets storage
  const savedPresets = ref<Record<string, Partial<TableConfig>>>({
    ...presets
  })

  // =============================================================================
  // 🔄 Computed Properties
  // =============================================================================

  const visibleColumns = computed(() => {
    if (!responsive) {
      return columns.value.filter(col => col.visible)
    }
    
    return columns.value.filter(col => 
      shouldColumnBeVisible(col, currentBreakpoint.value, config.value.responsive)
    )
  })

  const columnCount = computed(() => visibleColumns.value.length)

  const totalWidth = computed(() => calculateTotalWidth(visibleColumns.value))

  const isResponsive = computed(() => config.value.responsive.enabled)

  const responsiveColumns = computed(() => {
    if (!isResponsive.value) return columns.value
    return visibleColumns.value
  })

  // =============================================================================
  // 🛠️ Configuration Management
  // =============================================================================

  const updateConfig = (newConfig: Partial<TableConfig>) => {
    // Validate if validator is provided
    const mergedConfig = { ...config.value, ...newConfig }
    
    if (validateConfig && !validateConfig(mergedConfig)) {
      console.warn('設定の検証に失敗しました')
      return
    }

    config.value = mergedConfig
    
    // Update columns if provided
    if (newConfig.columns) {
      columns.value = [...newConfig.columns]
    }

    // Auto-save if enabled
    if (persist && autoSave) {
      saveToStorage(persistKey, config.value)
    }
  }

  const resetConfig = () => {
    const defaultConfig = createDefaultTableConfig()
    config.value = defaultConfig
    columns.value = []
    
    if (persist) {
      removeFromStorage(persistKey)
    }
  }

  const loadConfig = (configData: Partial<TableConfig>) => {
    updateConfig(configData)
  }

  // =============================================================================
  // 📋 Column Management
  // =============================================================================

  const addColumn = (column: TableColumn, index?: number) => {
    const newColumns = [...columns.value]
    
    if (index !== undefined && index >= 0 && index <= newColumns.length) {
      newColumns.splice(index, 0, column)
    } else {
      newColumns.push(column)
    }
    
    columns.value = newColumns
    updateConfig({ columns: newColumns })
  }

  const removeColumn = (columnId: string) => {
    const newColumns = columns.value.filter(col => col.id !== columnId)
    columns.value = newColumns
    updateConfig({ columns: newColumns })
  }

  const reorderColumns = (fromIndex: number, toIndex: number) => {
    const newColumns = [...columns.value]
    const [movedColumn] = newColumns.splice(fromIndex, 1)
    newColumns.splice(toIndex, 0, movedColumn)
    
    columns.value = newColumns
    updateConfig({ columns: newColumns })
  }

  const updateColumn = (columnId: string, updates: Partial<TableColumn>) => {
    const newColumns = columns.value.map(col => 
      col.id === columnId ? { ...col, ...updates } : col
    )
    
    columns.value = newColumns
    updateConfig({ columns: newColumns })
  }

  const duplicateColumn = (columnId: string) => {
    const sourceColumn = columns.value.find(col => col.id === columnId)
    if (sourceColumn) {
      const duplicatedColumn: TableColumn = {
        ...sourceColumn,
        id: `${sourceColumn.id}_copy_${Date.now()}`,
        label: `${sourceColumn.label} (コピー)`
      }
      
      const sourceIndex = columns.value.findIndex(col => col.id === columnId)
      addColumn(duplicatedColumn, sourceIndex + 1)
    }
  }

  const toggleColumnVisibility = (columnId: string) => {
    updateColumn(columnId, { 
      visible: !columns.value.find(col => col.id === columnId)?.visible 
    })
  }

  const resizeColumn = (columnId: string, width: ColumnWidth) => {
    updateColumn(columnId, { width })
  }

  // =============================================================================
  // 💾 Preset Management
  // =============================================================================

  const savePreset = (name: string, configToSave?: Partial<TableConfig>) => {
    const presetConfig = configToSave || config.value
    savedPresets.value = {
      ...savedPresets.value,
      [name]: presetConfig
    }
    
    // Also save to localStorage for persistence
    if (persist) {
      try {
        localStorage.setItem(
          `${STORAGE_PREFIX}presets_${persistKey}`, 
          JSON.stringify(savedPresets.value)
        )
      } catch (error) {
        console.warn('プリセットの保存に失敗しました:', error)
      }
    }
  }

  const loadPreset = (name: string) => {
    const preset = savedPresets.value[name]
    if (preset) {
      updateConfig(preset)
    }
  }

  const deletePreset = (name: string) => {
    const { [name]: deleted, ...remaining } = savedPresets.value
    savedPresets.value = remaining
    
    if (persist) {
      try {
        localStorage.setItem(
          `${STORAGE_PREFIX}presets_${persistKey}`, 
          JSON.stringify(savedPresets.value)
        )
      } catch (error) {
        console.warn('プリセットの削除に失敗しました:', error)
      }
    }
  }

  const listPresets = (): string[] => {
    return Object.keys(savedPresets.value)
  }

  // =============================================================================
  // 📱 Responsive Management
  // =============================================================================

  const updateBreakpoint = (breakpoint: BreakpointKey) => {
    currentBreakpoint.value = breakpoint
  }

  const getColumnVisibilityForBreakpoint = (breakpoint: BreakpointKey): Record<string, boolean> => {
    const visibility: Record<string, boolean> = {}
    
    columns.value.forEach(column => {
      visibility[column.id] = shouldColumnBeVisible(column, breakpoint, config.value.responsive)
    })
    
    return visibility
  }

  const optimizeForDevice = (deviceType: 'mobile' | 'tablet' | 'desktop') => {
    const optimizations: Partial<TableConfig> = {}
    
    switch (deviceType) {
      case 'mobile':
        optimizations.responsive = {
          ...config.value.responsive,
          mobileMode: 'cards'
        }
        optimizations.pagination = {
          ...config.value.pagination,
          pageSize: 20,
          position: 'bottom'
        }
        optimizations.appearance = {
          ...config.value.appearance,
          size: 'small',
          density: 'compact'
        }
        break
      
      case 'tablet':
        optimizations.pagination = {
          ...config.value.pagination,
          pageSize: 35,
          showQuickJumper: false
        }
        optimizations.appearance = {
          ...config.value.appearance,
          size: 'default'
        }
        break
      
      case 'desktop':
        optimizations.pagination = {
          ...config.value.pagination,
          pageSize: 50,
          showQuickJumper: true
        }
        optimizations.appearance = {
          ...config.value.appearance,
          size: 'large',
          density: 'comfortable'
        }
        break
    }
    
    updateConfig(optimizations)
  }

  // =============================================================================
  // ✅ Validation & Utils
  // =============================================================================

  const validateConfiguration = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    // Check columns
    if (columns.value.length === 0) {
      errors.push('少なくとも1つのカラムが必要です')
    }
    
    // Check for duplicate column IDs
    const columnIds = columns.value.map(col => col.id)
    const duplicateIds = columnIds.filter((id, index) => columnIds.indexOf(id) !== index)
    if (duplicateIds.length > 0) {
      errors.push(`重複するカラムIDがあります: ${duplicateIds.join(', ')}`)
    }
    
    // Check pagination
    if (config.value.pagination.enabled && config.value.pagination.pageSize <= 0) {
      errors.push('ページサイズは1以上である必要があります')
    }
    
    // Check virtual scrolling
    if (config.value.virtual.enabled && config.value.virtual.itemHeight <= 0) {
      errors.push('仮想スクロールのアイテム高さは1以上である必要があります')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  const exportConfig = (): string => {
    return JSON.stringify(config.value, null, 2)
  }

  const importConfig = (configJson: string): boolean => {
    try {
      const importedConfig = JSON.parse(configJson)
      
      // Basic validation
      if (typeof importedConfig !== 'object' || importedConfig === null) {
        throw new Error('無効な設定形式')
      }
      
      updateConfig(importedConfig)
      return true
    } catch (error) {
      console.error('設定のインポートに失敗しました:', error)
      return false
    }
  }

  // =============================================================================
  // 👂 Watchers & Event Listeners
  // =============================================================================

  // Watch for window resize to update breakpoint
  if (responsive && typeof window !== 'undefined') {
    const handleResize = () => {
      updateBreakpoint(getCurrentBreakpoint())
    }
    
    window.addEventListener('resize', handleResize)
    
    // Cleanup function would be called by the component using this composable
  }

  // Load presets from localStorage if persistence is enabled
  if (persist) {
    try {
      const storedPresets = localStorage.getItem(`${STORAGE_PREFIX}presets_${persistKey}`)
      if (storedPresets) {
        savedPresets.value = { ...savedPresets.value, ...JSON.parse(storedPresets) }
      }
    } catch (error) {
      console.warn('プリセットの読み込みに失敗しました:', error)
    }
  }

  // =============================================================================
  // 📤 Return Interface
  // =============================================================================

  return {
    // State
    config,
    columns,

    // Computed
    computed: {
      visibleColumns,
      columnCount,
      totalWidth,
      isResponsive,
      currentBreakpoint: computed(() => currentBreakpoint.value),
      responsiveColumns
    },

    // Actions
    actions: {
      // Configuration
      updateConfig,
      resetConfig,
      loadConfig,
      
      // Columns
      addColumn,
      removeColumn,
      reorderColumns,
      updateColumn,
      duplicateColumn,
      toggleColumnVisibility,
      resizeColumn,
      
      // Presets
      savePreset,
      loadPreset,
      deletePreset,
      listPresets,
      
      // Responsive
      updateBreakpoint,
      getColumnVisibilityForBreakpoint,
      optimizeForDevice,
      
      // Utils
      validateConfiguration,
      exportConfig,
      importConfig
    }
  }
}