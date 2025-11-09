import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseSortFilter from '../components/BaseSortFilter.vue'
import { createSortFilterConfig, createSortConfig, createFilterConfig } from '../index'
import type { SortFilterConfig } from '../types'

describe('BaseSortFilter.vue', () => {
  let wrapper: any
  let mockData: any[]
  let mockConfig: SortFilterConfig

  beforeEach(() => {
    mockData = [
      { id: 1, name: '田中太郎', age: 25, department: '営業', score: 85 },
      { id: 2, name: '佐藤花子', age: 30, department: 'マーケティング', score: 92 },
      { id: 3, name: '鈴木一郎', age: 20, department: '開発', score: 78 },
      { id: 4, name: '高橋美咲', age: 35, department: '営業', score: 88 },
      { id: 5, name: '田村次郎', age: 28, department: '開発', score: 95 }
    ]

    mockConfig = createSortFilterConfig(
      [
        createSortConfig('name', { label: '名前', type: 'text' }),
        createSortConfig('age', { label: '年齢', type: 'number' })
      ],
      [
        createFilterConfig('department', 'select', 'equals', { label: '部署' }),
        createFilterConfig('age', 'number', 'greaterThan', { label: '年齢' })
      ]
    )
  })

  it('正常にマウントされること', () => {
    wrapper = mount(BaseSortFilter, {
      props: {
        data: mockData,
        config: mockConfig
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.controls-container').exists()).toBe(true)
  })

  it('ソートとフィルタが組み合わせて動作すること', async () => {
    // フィルタ設定: 開発部のみ
    const configWithFilters = {
      ...mockConfig,
      filters: [
        {
          ...mockConfig.filters[0],
          value: '開発',
          enabled: true
        },
        ...mockConfig.filters.slice(1)
      ]
    }

    // ソート設定: 年齢昇順
    const configWithSort = {
      ...configWithFilters,
      sorts: [
        {
          ...configWithFilters.sorts[0],
        },
        {
          ...configWithFilters.sorts[1],
          direction: 'asc' as const
        }
      ]
    }

    wrapper = mount(BaseSortFilter, {
      props: {
        data: mockData,
        config: configWithSort
      }
    })

    // データ処理を実行
    await wrapper.vm.processData()

    expect(wrapper.emitted('data-changed')).toBeTruthy()
    
    const emittedData = wrapper.emitted('data-changed')[0][0]
    
    // 開発部のみかつ年齢でソート済み
    expect(emittedData.length).toBe(2)
    expect(emittedData.every((item: any) => item.department === '開発')).toBe(true)
    expect(emittedData[0].age).toBe(20) // 鈴木（年齢20）が最初
    expect(emittedData[1].age).toBe(28) // 田村（年齢28）が次
  })

  it('複数ソートが正しく動作すること', async () => {
    const multiSortConfig = {
      ...mockConfig,
      multiSort: true,
      sorts: [
        {
          ...mockConfig.sorts[0],
          key: 'department',
          direction: 'asc' as const
        },
        {
          ...mockConfig.sorts[1],
          direction: 'desc' as const
        }
      ]
    }

    wrapper = mount(BaseSortFilter, {
      props: {
        data: mockData,
        config: multiSortConfig
      }
    })

    await wrapper.vm.processData()

    const emittedData = wrapper.emitted('data-changed')[0][0]
    
    // 部署でソート、同じ部署内では年齢降順
    expect(emittedData[0].department).toBe('マーケティング') // アルファベット順で最初
    
    // 営業部のデータが年齢降順で並んでいる
    const salesData = emittedData.filter((item: any) => item.department === '営業')
    expect(salesData[0].age).toBeGreaterThan(salesData[1].age)
  })

  it('複数フィルタ（AND条件）が正しく動作すること', async () => {
    const multiFilterConfig = {
      ...mockConfig,
      multiFilter: true,
      filterLogic: 'AND' as const,
      filters: [
        {
          ...mockConfig.filters[0],
          key: 'department',
          value: '営業',
          enabled: true
        },
        {
          ...mockConfig.filters[1],
          key: 'age',
          operator: 'greaterThan' as any,
          value: 30,
          enabled: true
        }
      ]
    }

    wrapper = mount(BaseSortFilter, {
      props: {
        data: mockData,
        config: multiFilterConfig
      }
    })

    await wrapper.vm.processData()

    const emittedData = wrapper.emitted('data-changed')[0][0]
    
    // 営業部 かつ 年齢30より大きい = 高橋美咲（35歳、営業）
    expect(emittedData.length).toBe(1)
    expect(emittedData[0].department).toBe('営業')
    expect(emittedData[0].age).toBeGreaterThan(30)
    expect(emittedData[0].name).toBe('高橋美咲')
  })

  it('複数フィルタ（OR条件）が正しく動作すること', async () => {
    const multiFilterConfig = {
      ...mockConfig,
      multiFilter: true,
      filterLogic: 'OR' as const,
      filters: [
        {
          ...mockConfig.filters[0],
          key: 'department',
          value: '開発',
          enabled: true
        },
        {
          ...mockConfig.filters[1],
          key: 'age',
          operator: 'greaterThan' as any,
          value: 30,
          enabled: true
        }
      ]
    }

    wrapper = mount(BaseSortFilter, {
      props: {
        data: mockData,
        config: multiFilterConfig
      }
    })

    await wrapper.vm.processData()

    const emittedData = wrapper.emitted('data-changed')[0][0]
    
    // 開発部または30歳より上の条件を満たしている
    const hasCorrectCondition = emittedData.every((item: any) => 
      item.department === '開発' || item.age > 30
    )
    expect(hasCorrectCondition).toBe(true)
    expect(emittedData.length).toBeGreaterThanOrEqual(3) // 最低3件以上
  })

  it('クリア機能が正しく動作すること', async () => {
    // アクティブな設定を作成
    const activeConfig = {
      ...mockConfig,
      sorts: [
        {
          ...mockConfig.sorts[0],
          direction: 'asc' as const
        }
      ],
      filters: [
        {
          ...mockConfig.filters[0],
          value: '営業',
          enabled: true
        }
      ]
    }

    wrapper = mount(BaseSortFilter, {
      props: {
        data: mockData,
        config: activeConfig
      }
    })

    // クリアボタンが表示される
    expect(wrapper.find('.clear-button').exists()).toBe(true)

    // クリア実行
    await wrapper.vm.clearAll()

    // すべてリセットされる
    expect(wrapper.vm.localConfig.sorts[0].direction).toBe(null)
    expect(wrapper.vm.localConfig.filters[0].enabled).toBe(false)
    expect(wrapper.vm.localConfig.filters[0].value).toBe(null)
  })

  it('アクティブ条件表示が正しく動作すること', async () => {
    const activeConfig = {
      ...mockConfig,
      sorts: [
        {
          ...mockConfig.sorts[0],
          direction: 'asc' as const
        }
      ],
      filters: [
        {
          ...mockConfig.filters[0],
          value: '営業',
          enabled: true
        }
      ]
    }

    wrapper = mount(BaseSortFilter, {
      props: {
        data: mockData,
        config: activeConfig,
        showActiveConditions: true
      }
    })

    // アクティブ条件が表示される
    expect(wrapper.find('.active-conditions').exists()).toBe(true)
    expect(wrapper.find('.sort-tag').exists()).toBe(true)
    expect(wrapper.find('.filter-tag').exists()).toBe(true)
  })

  it('無効化状態で操作が停止すること', () => {
    wrapper = mount(BaseSortFilter, {
      props: {
        data: mockData,
        config: mockConfig,
        disabled: true
      }
    })

    const container = wrapper.find('.controls-container')
    expect(container.classes()).toContain('opacity-50')
  })
})