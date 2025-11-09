import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseSort from '../components/BaseSort.vue'
import type { SortConfig } from '../types'

describe('BaseSort.vue', () => {
  let wrapper: any
  let mockData: any[]
  let mockConfig: SortConfig

  beforeEach(() => {
    mockData = [
      { id: 1, name: '田中', age: 25 },
      { id: 2, name: '佐藤', age: 30 },
      { id: 3, name: '鈴木', age: 20 }
    ]

    mockConfig = {
      key: 'name',
      direction: null,
      label: '名前',
      type: 'text'
    }
  })

  it('正常にマウントされること', () => {
    wrapper = mount(BaseSort, {
      props: {
        data: mockData,
        config: mockConfig
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('名前')
  })

  it('ソート方向の切り替えが正しく動作すること', async () => {
    wrapper = mount(BaseSort, {
      props: {
        data: mockData,
        config: mockConfig
      }
    })

    const sortTrigger = wrapper.find('.sort-trigger')
    
    // 最初のクリック: 昇順
    await sortTrigger.trigger('click')
    expect(wrapper.emitted('sort-changed')).toBeTruthy()
    expect(wrapper.emitted('sort-changed')[0][1].direction).toBe('asc')

    // 2回目のクリック: 降順
    await wrapper.setProps({ 
      config: { ...mockConfig, direction: 'asc' } 
    })
    await sortTrigger.trigger('click')
    expect(wrapper.emitted('sort-changed')[1][1].direction).toBe('desc')

    // 3回目のクリック: リセット
    await wrapper.setProps({ 
      config: { ...mockConfig, direction: 'desc' } 
    })
    await sortTrigger.trigger('click')
    expect(wrapper.emitted('sort-changed')[2][1].direction).toBe(null)
  })

  it('数値ソートが正しく動作すること', async () => {
    const numberConfig = {
      key: 'age',
      direction: null as any,
      label: '年齢',
      type: 'number' as const
    }

    wrapper = mount(BaseSort, {
      props: {
        data: mockData,
        config: numberConfig
      }
    })

    const sortTrigger = wrapper.find('.sort-trigger')
    await sortTrigger.trigger('click')

    const emittedData = wrapper.emitted('sort-changed')[0][0]
    const ages = emittedData.map((item: any) => item.age)
    
    // 昇順でソートされている
    expect(ages[0]).toBe(20) // 最小値が先頭
    expect(ages[1]).toBe(25) 
    expect(ages[2]).toBe(30) // 最大値が最後
  })

  it('無効化状態で動作が停止すること', async () => {
    wrapper = mount(BaseSort, {
      props: {
        data: mockData,
        config: mockConfig,
        disabled: true
      }
    })

    const sortTrigger = wrapper.find('.sort-trigger')
    await sortTrigger.trigger('click')

    expect(wrapper.emitted('sort-changed')).toBeFalsy()
  })

  it('ネストしたオブジェクトのソートが動作すること', async () => {
    const nestedData = [
      { id: 1, user: { profile: { name: 'C太郎' } } },
      { id: 2, user: { profile: { name: 'A花子' } } },
      { id: 3, user: { profile: { name: 'B一郎' } } }
    ]

    const nestedConfig = {
      key: 'user.profile.name',
      direction: null as any,
      label: 'ユーザー名',
      type: 'text' as const
    }

    wrapper = mount(BaseSort, {
      props: {
        data: nestedData,
        config: nestedConfig
      }
    })

    const sortTrigger = wrapper.find('.sort-trigger')
    await sortTrigger.trigger('click')

    const emittedData = wrapper.emitted('sort-changed')[0][0]
    const names = emittedData.map((item: any) => item.user.profile.name)
    
    // 昇順でソートされている
    expect(names[0]).toBe('A花子')
    expect(names[1]).toBe('B一郎')
    expect(names[2]).toBe('C太郎')
  })

  it('null/undefined値の処理が正しく行われること', async () => {
    const dataWithNulls = [
      { id: 1, name: 'B' },
      { id: 2, name: null },
      { id: 3, name: 'A' },
      { id: 4, name: undefined }
    ]

    wrapper = mount(BaseSort, {
      props: {
        data: dataWithNulls,
        config: { ...mockConfig, direction: null }
      }
    })

    const sortTrigger = wrapper.find('.sort-trigger')
    await sortTrigger.trigger('click')

    const emittedData = wrapper.emitted('sort-changed')[0][0]
    const validNames = emittedData.filter((item: any) => item.name !== null && item.name !== undefined)
    
    // 有効な値が正しくソートされている
    expect(validNames[0].name).toBe('A')
    expect(validNames[1].name).toBe('B')
  })
})