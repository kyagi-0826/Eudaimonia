/**
 * @fileoverview useTableResponsive Composable
 * @description レスポンシブテーブル機能（ブレイクポイント管理、モバイル表示モード）
 */

import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue'
import type { TableColumn, BreakpointKey, ResponsiveValue } from '../types'

// =============================================================================
// 📱 Breakpoint Definitions
// =============================================================================

export const BREAKPOINTS = {
  xs: 0,      // Extra Small - モバイル（縦持ち）
  sm: 640,    // Small - モバイル（横持ち）、小型タブレット
  md: 768,    // Medium - タブレット
  lg: 1024,   // Large - デスクトップ
  xl: 1280,   // Extra Large - 大型デスクトップ
  xxl: 1536   // 2X Large - 超大型ディスプレイ
} as const

export type ViewportMode = 'table' | 'stack' | 'cards' | 'compact'

// =============================================================================
// 🎯 Interface Definitions  
// =============================================================================

export interface ResponsiveConfig {
  autoHideColumns: boolean      // カラム自動非表示
  stackMode: ViewportMode       // 小画面での表示モード
  cardMode: ViewportMode        // カード表示モード
  priorityThreshold: number     // 優先度閾値
  enableTouch: boolean          // タッチ操作対応
  swipeThreshold: number        // スワイプ感度
}

export interface ResponsiveState {
  currentBreakpoint: BreakpointKey
  screenWidth: number
  screenHeight: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isPortrait: boolean
  isLandscape: boolean
  viewportMode: ViewportMode
  visibleColumns: TableColumn[]
  hiddenColumns: TableColumn[]
  touchSupported: boolean
}

export interface ResponsiveActions {
  setViewportMode: (mode: ViewportMode) => void
  toggleColumn: (columnId: string) => void
  showAllColumns: () => void
  hideNonEssentialColumns: () => void
  optimizeForViewport: () => void
  handleResize: () => void
}

// =============================================================================
// 🔧 useTableResponsive Composable
// =============================================================================

export function useTableResponsive(
  columns: Readonly<Ref<TableColumn[]>> | TableColumn[],
  config: ResponsiveConfig = {
    autoHideColumns: true,
    stackMode: 'stack',
    cardMode: 'cards',
    priorityThreshold: 768,
    enableTouch: true,
    swipeThreshold: 50
  }
) {
  // =============================================================================
  // 📊 Reactive State
  // =============================================================================

  const screenWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const screenHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 768)
  const currentBreakpoint = ref<BreakpointKey>('lg')
  const viewportMode = ref<ViewportMode>('table')
  const manualColumnVisibility = ref<Record<string, boolean>>({})

  // =============================================================================
  // 📊 Computed Properties
  // =============================================================================

  const columnsArray = computed(() => {
    return Array.isArray(columns) ? columns : columns.value
  })

  const isMobile = computed(() => screenWidth.value < BREAKPOINTS.md)
  const isTablet = computed(() => 
    screenWidth.value >= BREAKPOINTS.md && screenWidth.value < BREAKPOINTS.lg
  )
  const isDesktop = computed(() => screenWidth.value >= BREAKPOINTS.lg)
  const isPortrait = computed(() => screenHeight.value > screenWidth.value)
  const isLandscape = computed(() => screenWidth.value > screenHeight.value)

  const touchSupported = computed(() => 
    typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  )

  // ブレイクポイント判定
  const currentBreakpointComputed = computed<BreakpointKey>(() => {
    const width = screenWidth.value
    
    if (width < BREAKPOINTS.sm) return 'xs'
    if (width < BREAKPOINTS.md) return 'sm'
    if (width < BREAKPOINTS.lg) return 'md'
    if (width < BREAKPOINTS.xl) return 'lg'
    if (width < BREAKPOINTS.xxl) return 'xl'
    return 'xxl'
  })

  // 表示モード自動判定
  const autoViewportMode = computed<ViewportMode>(() => {
    if (isMobile.value) {
      return isPortrait.value ? config.stackMode : config.cardMode
    }
    if (isTablet.value && isPortrait.value) {
      return config.cardMode
    }
    return 'table'
  })

  // カラムの優先度計算
  const getColumnPriority = (column: TableColumn): number => {
    // 必須項目があるカラムは高優先度
    const hasRequired = column.items.some(item => item.required)
    if (hasRequired) return 1000

    // 明示的な優先度設定
    const explicitPriority = column.items.reduce((max, item) => {
      const priority = item.priority === 'high' ? 900 : 
                      item.priority === 'medium' ? 500 : 100
      return Math.max(max, priority)
    }, 0)

    if (explicitPriority > 0) return explicitPriority

    // フォールバック: アイテム数ベース
    return column.items.length * 50
  }

  // 表示可能カラム計算
  const visibleColumns = computed(() => {
    const visible = columnsArray.value.filter((column: TableColumn) => {
      // 手動設定が優先
      if (manualColumnVisibility.value[column.id] !== undefined) {
        return manualColumnVisibility.value[column.id]
      }

      // 自動非表示が無効の場合はすべて表示
      if (!config.autoHideColumns) {
        return column.visible !== false
      }

      // ブレイクポイント設定に基づく表示制御
      if (column.hideOn?.includes(currentBreakpoint.value)) {
        return false
      }

      if (column.showOnlyOn && !column.showOnlyOn.includes(currentBreakpoint.value)) {
        return false
      }

      // 画面幅が狭い場合の優先度フィルタリング
      if (screenWidth.value < config.priorityThreshold) {
        return getColumnPriority(column) >= 500 // medium以上のみ
      }

      return column.visible !== false
    })

    // 優先度順でソート
    visible.sort((a: TableColumn, b: TableColumn) => getColumnPriority(b) - getColumnPriority(a))

    return visible
  })

  const hiddenColumns = computed(() => 
    columnsArray.value.filter((column: TableColumn) => 
      !visibleColumns.value.some((v: TableColumn) => v.id === column.id)
    )
  )

  // レスポンシブ状態
  const responsiveState = computed<ResponsiveState>(() => ({
    currentBreakpoint: currentBreakpoint.value,
    screenWidth: screenWidth.value,
    screenHeight: screenHeight.value,
    isMobile: isMobile.value,
    isTablet: isTablet.value,
    isDesktop: isDesktop.value,
    isPortrait: isPortrait.value,
    isLandscape: isLandscape.value,
    viewportMode: viewportMode.value,
    visibleColumns: visibleColumns.value,
    hiddenColumns: hiddenColumns.value,
    touchSupported: touchSupported.value
  }))

  // =============================================================================
  // 🎯 Actions & Methods
  // =============================================================================

  const handleResize = () => {
    if (typeof window === 'undefined') return

    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
  }

  const setViewportMode = (mode: ViewportMode) => {
    viewportMode.value = mode
  }

  const toggleColumn = (columnId: string) => {
    const current = manualColumnVisibility.value[columnId]
    const column = columnsArray.value.find((c: TableColumn) => c.id === columnId)
    
    if (!column) return

    const newVisibility = current !== undefined ? !current : !column.visible
    manualColumnVisibility.value[columnId] = newVisibility
  }

  const showAllColumns = () => {
    manualColumnVisibility.value = {}
    columnsArray.value.forEach((column: TableColumn) => {
      manualColumnVisibility.value[column.id] = true
    })
  }

  const hideNonEssentialColumns = () => {
    columnsArray.value.forEach((column: TableColumn) => {
      const priority = getColumnPriority(column)
      manualColumnVisibility.value[column.id] = priority >= 900 // high以上のみ
    })
  }

  const optimizeForViewport = () => {
    const mode = autoViewportMode.value
    setViewportMode(mode)

    if (config.autoHideColumns) {
      if (mode === 'stack' || mode === 'cards') {
        // モバイルモードでは重要カラムのみ表示
        hideNonEssentialColumns()
      } else if (mode === 'table' && isDesktop.value) {
        // デスクトップでは全カラム表示
        showAllColumns()
      }
    }
  }

  // レスポンシブ値の解決
  const resolveResponsiveValue = <T>(value: ResponsiveValue<T>): T => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // ブレイクポイント設定を現在のブレイクポイントで解決
      const responsive = value as Partial<Record<BreakpointKey, T>>
      
      // 現在のブレイクポイント以下で最も適切な値を探す
      const orderedBreakpoints: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
      const currentIndex = orderedBreakpoints.indexOf(currentBreakpoint.value)
      
      for (let i = currentIndex; i >= 0; i--) {
        const bp = orderedBreakpoints[i]
        if (responsive[bp] !== undefined) {
          return responsive[bp]!
        }
      }
      
      // フォールバック: 最初の有効な値
      for (const bp of orderedBreakpoints) {
        if (responsive[bp] !== undefined) {
          return responsive[bp]!
        }
      }
    }
    
    return value as T
  }

  // CSS クラス生成
  const getResponsiveClasses = () => {
    return {
      [`breakpoint-${currentBreakpoint.value}`]: true,
      [`viewport-${viewportMode.value}`]: true,
      'is-mobile': isMobile.value,
      'is-tablet': isTablet.value,
      'is-desktop': isDesktop.value,
      'is-portrait': isPortrait.value,
      'is-landscape': isLandscape.value,
      'touch-supported': touchSupported.value,
      'auto-hide-enabled': config.autoHideColumns
    }
  }

  const responsiveActions: ResponsiveActions = {
    setViewportMode,
    toggleColumn,
    showAllColumns,
    hideNonEssentialColumns,
    optimizeForViewport,
    handleResize
  }

  // =============================================================================
  // 🔄 Watchers & Lifecycle
  // =============================================================================

  // ブレイクポイント変更の監視
  watch(currentBreakpointComputed, (newBreakpoint) => {
    currentBreakpoint.value = newBreakpoint
    
    // 自動最適化
    if (config.autoHideColumns) {
      optimizeForViewport()
    }
  })

  // 画面向き変更の監視
  watch([isPortrait, isMobile], () => {
    if (viewportMode.value === autoViewportMode.value || config.autoHideColumns) {
      optimizeForViewport()
    }
  })

  // リサイズイベントリスナー
  onMounted(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100) // 向き変更後の遅延
    })

    // 初期最適化
    handleResize()
    optimizeForViewport()
  })

  onUnmounted(() => {
    if (typeof window === 'undefined') return
    
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleResize)
  })

  // =============================================================================
  // 🚀 Return Composable
  // =============================================================================

  return {
    // State
    responsiveState,
    
    // Computed
    isMobile,
    isTablet,
    isDesktop,
    isPortrait,
    isLandscape,
    currentBreakpoint,
    viewportMode,
    visibleColumns,
    hiddenColumns,
    touchSupported,
    
    // Actions
    ...responsiveActions,
    
    // Utilities
    resolveResponsiveValue,
    getResponsiveClasses,
    getColumnPriority,
    
    // Constants
    BREAKPOINTS
  }
}

// =============================================================================
// 🛠️ Utility Functions
// =============================================================================

/**
 * ブレイクポイントでの値解決ヘルパー
 */
export function createResponsiveValue<T>(
  values: Partial<Record<BreakpointKey, T>>
): ResponsiveValue<T> {
  return values as ResponsiveValue<T>
}

/**
 * メディアクエリ生成ヘルパー
 */
export function createMediaQuery(breakpoint: BreakpointKey, type: 'min' | 'max' = 'min'): string {
  const width = BREAKPOINTS[breakpoint]
  return `(${type}-width: ${width}px)`
}

/**
 * レスポンシブ設定のデフォルト値
 */
export const DEFAULT_RESPONSIVE_CONFIG: ResponsiveConfig = {
  autoHideColumns: true,
  stackMode: 'stack',
  cardMode: 'cards',
  priorityThreshold: 768,
  enableTouch: true,
  swipeThreshold: 50
}