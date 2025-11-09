import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseFilter from '../components/BaseFilter.vue'
import type { FilterConfig } from '../types'

describe('BaseFilter.vue', () => {
  let wrapper: any
  let mockData: any[]
  let mockConfig: FilterConfig

  beforeEach(() => {
    mockData = [
      { id: 1, name: '田中', age: 25, department: '営業' },
      { id: 2, name: '佐藤', age: 30, department: 'マーケティング' },
      { id: 3, name: '鈴木', age: 20, department: '開発' },
      { id: 4, name: '高橋', age: 35, department: '営業' }
    ]

    mockConfig = {
      key: 'department',
      type: 'select',
      operator: 'equals',
      value: null,
      enabled: false,
      label: '部署'
    }
  })

  it('正常にマウントされること', () => {
    wrapper = mount(BaseFilter, {
      props: {
        data: mockData,
        config: mockConfig
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.filter-button').exists()).toBe(true)
  })

  it('フィルタ設定の初期状態が正しいこと', () => {
    wrapper = mount(BaseFilter, {
      props: {
        data: mockData,
        config: mockConfig
      }
    })

    // 初期状態ではフィルタは非アクティブ
    expect(wrapper.vm.hasActiveFilters).toBe(false)
    expect(wrapper.vm.activeFilterCount).toBe(0)
    
    // フィルタボタンが存在し、非アクティブ状態
    const filterButton = wrapper.find('.filter-button')
    expect(filterButton.exists()).toBe(true)
    expect(filterButton.classes()).not.toContain('active')
  })

  it('テキストフィルタが正しく動作すること', async () => {
    const textConfig: FilterConfig = {
      key: 'name',
      type: 'text',
      operator: 'contains',
      value: '田',
      enabled: true,
      label: '名前'
    }

    wrapper = mount(BaseFilter, {
      props: {
        data: mockData,
        config: textConfig
      }
    })

    // フィルタ実行のシミュレーション
    await wrapper.vm.applyFilter()

    expect(wrapper.emitted('filter-changed')).toBeTruthy()
    
    // 結果データに「田」を含むアイテムのみが含まれる
    const emittedData = wrapper.emitted('filter-changed')[0][0]
    expect(emittedData.every((item: any) => item.name.includes('田'))).toBe(true)
  })

  it('数値フィルタ（範囲）が正しく動作すること', async () => {
    const numberConfig: FilterConfig = {
      key: 'age',
      type: 'number',
      operator: 'between',
      value: [25, 35],
      enabled: true,
      label: '年齢'
    }

    wrapper = mount(BaseFilter, {
      props: {
        data: mockData,
        config: numberConfig
      }
    })

    await wrapper.vm.applyFilter()

    const emittedData = wrapper.emitted('filter-changed')[0][0]
    expect(emittedData.length).toBe(3) // 25, 30, 35 の3件
    expect(emittedData.every((item: any) => item.age >= 25 && item.age <= 35)).toBe(true)
  })

  it('セレクトフィルタが正しく動作すること', async () => {
    const selectConfig: FilterConfig = {
      key: 'department',
      type: 'select',
      operator: 'equals',
      value: '営業',
      enabled: true,
      label: '部署'
    }

    wrapper = mount(BaseFilter, {
      props: {
        data: mockData,
        config: selectConfig
      }
    })

    await wrapper.vm.applyFilter()

    const emittedData = wrapper.emitted('filter-changed')[0][0]
    expect(emittedData.length).toBe(2) // 営業部の2件
    expect(emittedData.every((item: any) => item.department === '営業')).toBe(true)
  })

  it('複数選択フィルタが正しく動作すること', async () => {
    const multiSelectConfig: FilterConfig = {
      key: 'department',
      type: 'select',
      operator: 'in',
      value: ['営業', '開発'],
      enabled: true,
      label: '部署'
    }

    wrapper = mount(BaseFilter, {
      props: {
        data: mockData,
        config: multiSelectConfig
      }
    })

    await wrapper.vm.applyFilter()

    const emittedData = wrapper.emitted('filter-changed')[0][0]
    expect(emittedData.length).toBe(3) // 営業2件 + 開発1件
    expect(emittedData.every((item: any) => 
      ['営業', '開発'].includes(item.department)
    )).toBe(true)
  })

  it('無効化状態でフィルタが動作しないこと', async () => {
    wrapper = mount(BaseFilter, {
      props: {
        data: mockData,
        config: mockConfig,
        disabled: true
      }
    })

    const filterButton = wrapper.find('.filter-button')
    await filterButton.trigger('click')

    // ダイアログが開かない
    expect(wrapper.find('.filter-dialog-overlay').exists()).toBe(false)
  })

  it('null/undefined値を含むデータでもエラーが発生しないこと', async () => {
    const dataWithNulls = [
      { id: 1, name: '田中', department: '営業' },
      { id: 2, name: null, department: 'マーケティング' },
      { id: 3, name: '鈴木', department: null },
      { id: 4, name: undefined, department: undefined }
    ]

    const textConfig: FilterConfig = {
      key: 'name',
      type: 'text',
      operator: 'contains',
      value: '田',
      enabled: true,
      label: '名前'
    }

    wrapper = mount(BaseFilter, {
      props: {
        data: dataWithNulls,
        config: textConfig
      }
    })

    await wrapper.vm.applyFilter()

    expect(wrapper.emitted('filter-changed')).toBeTruthy()
    
    const emittedData = wrapper.emitted('filter-changed')[0][0]
    // null/undefinedは除外され、「田」を含むアイテムのみが残る
    expect(emittedData.length).toBe(1)
    expect(emittedData[0].name).toBe('田中')
  })

  it('利用可能オプションが正しく計算されること', () => {
    wrapper = mount(BaseFilter, {
      props: {
        data: mockData,
        config: mockConfig
      }
    })

    const availableOptions = wrapper.vm.availableOptions
    // ソートされた順序で確認
    expect(availableOptions.sort()).toEqual(['マーケティング', '営業', '開発'].sort())
  })
})