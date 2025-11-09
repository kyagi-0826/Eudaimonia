/**
 * @fileoverview useTableResponsive Simplified Tests
 * @description 実装と整合性を保ったレスポンシブテーブル機能のテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { 
  useTableResponsive,
  BREAKPOINTS,
  type ResponsiveConfig
} from '../composables/useTableResponsive'
import type { TableColumn } from '../types'

// Mock window and DOM APIs
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
})

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  configurable: true,
  value: vi.fn(),
})

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  configurable: true,
  value: vi.fn(),
})

// Mock touch capabilities
Object.defineProperty(window, 'ontouchstart', {
  writable: true,
  configurable: true,
  value: null,
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb: any) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock columns data with all required properties
const mockColumns: TableColumn[] = [
  {
    id: 'essential',
    label: '重要',
    items: [{ key: 'name', label: '名前', type: 'text', priority: 'high', required: true }],
    width: { type: 'fixed', value: 200 },
    resizable: true,
    visible: true
  },
  {
    id: 'important',
    label: '重要',
    items: [{ key: 'email', label: 'メール', type: 'email', priority: 'high' }],
    width: { type: 'fixed', value: 250 },
    resizable: true,
    visible: true
  },
  {
    id: 'optional',
    label: '任意',
    items: [{ key: 'phone', label: '電話', type: 'text', priority: 'low' }],
    width: { type: 'fixed', value: 180 },
    resizable: true,
    visible: true
  }
]

describe('useTableResponsive', () => {
  beforeEach(() => {
    // Reset window size to desktop
    window.innerWidth = 1024
    window.innerHeight = 768
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should initialize without errors', () => {
      const responsive = useTableResponsive(mockColumns)
      
      expect(responsive).toBeDefined()
      expect(responsive.visibleColumns).toBeDefined()
      expect(responsive.currentBreakpoint).toBeDefined()
    })

    it('should detect desktop breakpoints', () => {
      window.innerWidth = 1200
      
      const responsive = useTableResponsive(mockColumns)
      responsive.handleResize()
      
      expect(responsive.isDesktop.value).toBe(true)
      expect(responsive.isMobile.value).toBe(false)
    })

    it('should detect mobile breakpoints', () => {
      window.innerWidth = 640
      
      const responsive = useTableResponsive(mockColumns)
      responsive.handleResize()

      expect(responsive.isMobile.value).toBe(true)
    })
  })

  describe('Column Management', () => {
    it('should show all columns by default', () => {
      const responsive = useTableResponsive(mockColumns)
      
      expect(responsive.visibleColumns.value.length).toBeGreaterThan(0)
    })

    it('should provide column visibility controls', () => {
      const responsive = useTableResponsive(mockColumns)

      expect(typeof responsive.toggleColumn).toBe('function')
      expect(typeof responsive.showAllColumns).toBe('function')
      expect(typeof responsive.hideNonEssentialColumns).toBe('function')
    })

    it('should calculate column priorities', () => {
      const responsive = useTableResponsive(mockColumns)
      
      const priority = responsive.getColumnPriority(mockColumns[0])
      expect(typeof priority).toBe('number')
      expect(priority).toBeGreaterThan(0)
    })
  })

  describe('Responsive Behavior', () => {
    it('should provide viewport mode controls', () => {
      const responsive = useTableResponsive(mockColumns)

      expect(typeof responsive.setViewportMode).toBe('function')
      expect(typeof responsive.optimizeForViewport).toBe('function')
      
      responsive.setViewportMode('cards')
      expect(responsive.viewportMode.value).toBe('cards')
    })

    it('should detect touch support', () => {
      const responsive = useTableResponsive(mockColumns)

      expect(typeof responsive.touchSupported.value).toBe('boolean')
    })

    it('should generate responsive classes', () => {
      const responsive = useTableResponsive(mockColumns)
      
      const classes = responsive.getResponsiveClasses()
      expect(typeof classes).toBe('object')
      expect(classes).toHaveProperty('is-desktop')
    })
  })

  describe('Utilities', () => {
    it('should resolve responsive values', () => {
      const responsive = useTableResponsive(mockColumns)
      
      const testValue = responsive.resolveResponsiveValue({
        xs: 'mobile',
        lg: 'desktop'
      })
      
      expect(typeof testValue).toBe('string')
    })

    it('should provide responsive state', () => {
      const responsive = useTableResponsive(mockColumns)
      
      expect(responsive.responsiveState.value).toBeDefined()
      expect(responsive.responsiveState.value).toHaveProperty('currentBreakpoint')
      expect(responsive.responsiveState.value).toHaveProperty('isMobile')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty columns gracefully', () => {
      const responsive = useTableResponsive([])
      
      expect(responsive.visibleColumns.value).toEqual([])
    })

    it('should handle resize events', async () => {
      const responsive = useTableResponsive(mockColumns)
      
      window.innerWidth = 600
      responsive.handleResize()
      await nextTick()

      expect(responsive.isMobile.value).toBe(true)
    })
  })
})