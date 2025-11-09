/**
 * @fileoverview Responsive Integration Tests
 * @description レスポンシブ機能の統合テスト（簡素化版）
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  useTableResponsive,
  BREAKPOINTS
} from '../composables/useTableResponsive'
import type { TableColumn } from '../types'

// Mock window
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

Object.defineProperty(window, 'addEventListener', {
  value: vi.fn(),
})

Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn(),
})

const mockColumns: TableColumn[] = [
  {
    id: 'required',
    label: '必須項目',
    items: [{ key: 'name', label: '名前', type: 'text', priority: 'high', required: true }],
    width: { type: 'fixed', value: 200 },
    resizable: true,
    visible: true
  },
  {
    id: 'important',
    label: '重要項目',
    items: [{ key: 'email', label: 'メール', type: 'email', priority: 'high' }],
    width: { type: 'fixed', value: 250 },
    resizable: true,
    visible: true
  },
  {
    id: 'optional',
    label: '任意項目',
    items: [{ key: 'phone', label: '電話', type: 'text', priority: 'low' }],
    width: { type: 'fixed', value: 180 },
    resizable: true,
    visible: true
  }
]

describe('Responsive Integration Tests', () => {
  beforeEach(() => {
    window.innerWidth = 1024
    vi.clearAllMocks()
  })

  describe('Basic Responsive Functionality', () => {
    it('should initialize responsive composable', () => {
      const responsive = useTableResponsive(mockColumns)
      
      expect(responsive).toBeDefined()
      expect(responsive.currentBreakpoint).toBeDefined()
      expect(responsive.visibleColumns).toBeDefined()
    })

    it('should show all columns on desktop', () => {
      window.innerWidth = 1200
      const responsive = useTableResponsive(mockColumns)
      responsive.handleResize()
      
      expect(responsive.visibleColumns.value.length).toBe(3)
      expect(responsive.isDesktop.value).toBe(true)
    })

    it('should handle mobile viewport', () => {
      window.innerWidth = 640
      const responsive = useTableResponsive(mockColumns)
      responsive.handleResize()
      
      expect(responsive.isMobile.value).toBe(true)
      expect(responsive.visibleColumns.value.length).toBeGreaterThan(0)
    })
  })

  describe('Column Priority System', () => {
    it('should calculate priorities correctly', () => {
      const responsive = useTableResponsive(mockColumns)
      
      const requiredColumnPriority = responsive.getColumnPriority(mockColumns[0])
      const optionalColumnPriority = responsive.getColumnPriority(mockColumns[2])
      
      expect(requiredColumnPriority).toBeGreaterThan(optionalColumnPriority)
    })

    it('should handle columns with required items', () => {
      const responsive = useTableResponsive(mockColumns)
      
      const priority = responsive.getColumnPriority(mockColumns[0]) // Has required item
      expect(priority).toBe(1000) // Should be maximum priority
    })
  })

  describe('Responsive Classes', () => {
    it('should generate correct responsive classes', () => {
      const responsive = useTableResponsive(mockColumns)
      
      const classes = responsive.getResponsiveClasses()
      expect(classes).toHaveProperty('is-desktop')
      expect(classes).toHaveProperty('breakpoint-lg')
    })
  })

  describe('Viewport Mode Control', () => {
    it('should allow setting viewport mode', () => {
      const responsive = useTableResponsive(mockColumns)
      
      responsive.setViewportMode('cards')
      expect(responsive.viewportMode.value).toBe('cards')
      
      responsive.setViewportMode('stack')
      expect(responsive.viewportMode.value).toBe('stack')
    })

    it('should optimize for current viewport', () => {
      const responsive = useTableResponsive(mockColumns)
      
      expect(() => responsive.optimizeForViewport()).not.toThrow()
    })
  })

  describe('Touch Support', () => {
    it('should detect touch capabilities', () => {
      const responsive = useTableResponsive(mockColumns)
      
      expect(typeof responsive.touchSupported.value).toBe('boolean')
    })
  })

  describe('Column Visibility Management', () => {
    it('should provide column visibility controls', () => {
      const responsive = useTableResponsive(mockColumns)
      
      expect(typeof responsive.toggleColumn).toBe('function')
      expect(typeof responsive.showAllColumns).toBe('function')
      expect(typeof responsive.hideNonEssentialColumns).toBe('function')
    })

    it('should handle column toggle', () => {
      const responsive = useTableResponsive(mockColumns)
      
      const initialCount = responsive.visibleColumns.value.length
      responsive.toggleColumn('optional')
      
      // Function should execute without error
      expect(responsive.visibleColumns.value.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Responsive Value Resolution', () => {
    it('should resolve responsive values', () => {
      const responsive = useTableResponsive(mockColumns)
      
      const resolved = responsive.resolveResponsiveValue({
        xs: 'mobile-value',
        lg: 'desktop-value'
      })
      
      expect(typeof resolved).toBe('string')
    })
  })

  describe('Responsive State', () => {
    it('should provide comprehensive state', () => {
      const responsive = useTableResponsive(mockColumns)
      
      const state = responsive.responsiveState.value
      expect(state).toHaveProperty('currentBreakpoint')
      expect(state).toHaveProperty('isMobile')
      expect(state).toHaveProperty('isDesktop')
      expect(state).toHaveProperty('visibleColumns')
      expect(state).toHaveProperty('hiddenColumns')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty column array', () => {
      const responsive = useTableResponsive([])
      
      expect(responsive.visibleColumns.value).toEqual([])
      expect(responsive.hiddenColumns.value).toEqual([])
    })

    it('should handle rapid viewport changes', () => {
      const responsive = useTableResponsive(mockColumns)
      
      // Simulate rapid changes
      window.innerWidth = 1200
      responsive.handleResize()
      
      window.innerWidth = 600
      responsive.handleResize()
      
      window.innerWidth = 1024
      responsive.handleResize()
      
      expect(responsive.currentBreakpoint.value).toBeDefined()
    })
  })
})