/**
 * @fileoverview BaseTable Demo Data
 * @description レスポンシブテーブルのデモ用サンプルデータ
 */

import type { TableItem, TableColumn } from './types'

// =============================================================================
// 📊 Sample Data
// =============================================================================

export const sampleUsers: TableItem[] = [
  {
    id: 1,
    avatar: '/avatars/user1.jpg',
    name: '田中 太郎',
    email: 'tanaka.taro@example.com',
    department: '開発部',
    position: 'シニアエンジニア',
    skills: ['Vue.js', 'TypeScript', 'Node.js'],
    salary: 8500000,
    experience: 5,
    joinDate: '2019-04-01',
    status: 'アクティブ',
    projects: ['プロジェクトA', 'プロジェクトB'],
    rating: 4.5,
    phone: '090-1234-5678',
    location: '東京',
    manager: '佐藤 花子',
    birthday: '1990-03-15',
    lastLogin: '2024-01-15T09:30:00Z',
    priority: 'high',
    category: 'フルタイム'
  },
  {
    id: 2,
    avatar: '/avatars/user2.jpg',
    name: '佐藤 花子',
    email: 'sato.hanako@example.com',
    department: 'デザイン部',
    position: 'UIデザイナー',
    skills: ['Figma', 'Adobe XD', 'Sketch'],
    salary: 7200000,
    experience: 3,
    joinDate: '2021-01-15',
    status: 'アクティブ',
    projects: ['プロジェクトC', 'プロジェクトD'],
    rating: 4.8,
    phone: '080-9876-5432',
    location: '大阪',
    manager: '鈴木 一郎',
    birthday: '1992-08-22',
    lastLogin: '2024-01-14T16:45:00Z',
    priority: 'medium',
    category: 'フルタイム'
  },
  {
    id: 3,
    avatar: '/avatars/user3.jpg',
    name: '鈴木 一郎',
    email: 'suzuki.ichiro@example.com',
    department: '営業部',
    position: 'セールスマネージャー',
    skills: ['営業戦略', 'プレゼンテーション', 'CRM'],
    salary: 9200000,
    experience: 8,
    joinDate: '2016-09-01',
    status: '休暇中',
    projects: ['クライアントA', 'クライアントB'],
    rating: 4.2,
    phone: '090-5555-1234',
    location: '名古屋',
    manager: null,
    birthday: '1985-12-03',
    lastLogin: '2024-01-10T11:20:00Z',
    priority: 'high',
    category: 'フルタイム'
  },
  {
    id: 4,
    avatar: '/avatars/user4.jpg',
    name: '山田 美咲',
    email: 'yamada.misaki@example.com',
    department: 'マーケティング部',
    position: 'デジタルマーケター',
    skills: ['Google Analytics', 'Facebook Ads', 'SEO'],
    salary: 6800000,
    experience: 2,
    joinDate: '2022-03-01',
    status: 'アクティブ',
    projects: ['キャンペーンX', 'キャンペーンY'],
    rating: 4.6,
    phone: '070-2222-9999',
    location: '福岡',
    manager: '佐藤 花子',
    birthday: '1995-06-18',
    lastLogin: '2024-01-15T14:10:00Z',
    priority: 'medium',
    category: 'パートタイム'
  },
  {
    id: 5,
    avatar: '/avatars/user5.jpg',
    name: '高橋 健太',
    email: 'takahashi.kenta@example.com',
    department: 'IT部',
    position: 'インフラエンジニア',
    skills: ['AWS', 'Docker', 'Kubernetes'],
    salary: 7800000,
    experience: 4,
    joinDate: '2020-07-15',
    status: 'アクティブ',
    projects: ['インフラ改善', 'セキュリティ強化'],
    rating: 4.3,
    phone: '090-7777-4444',
    location: '札幌',
    manager: '田中 太郎',
    birthday: '1988-11-25',
    lastLogin: '2024-01-15T08:45:00Z',
    priority: 'low',
    category: 'フルタイム'
  },
  {
    id: 6,
    avatar: '/avatars/user6.jpg',
    name: '伊藤 さくら',
    email: 'ito.sakura@example.com',
    department: '人事部',
    position: 'HRスペシャリスト',
    skills: ['採用', '教育研修', 'Excel'],
    salary: 6500000,
    experience: 6,
    joinDate: '2018-02-01',
    status: 'アクティブ',
    projects: ['新卒採用', '研修プログラム'],
    rating: 4.7,
    phone: '080-3333-7777',
    location: '神戸',
    manager: '鈴木 一郎',
    birthday: '1987-04-09',
    lastLogin: '2024-01-14T13:25:00Z',
    priority: 'medium',
    category: 'フルタイム'
  }
]

// =============================================================================
// 🏗️ Column Configuration
// =============================================================================

export const sampleColumns: TableColumn[] = [
  {
    id: 'user-info',
    label: 'ユーザー情報',
    visible: true,
    resizable: true,
    width: { type: 'minmax', min: 200, max: 300 },
    items: [
      {
        key: 'avatar',
        label: 'アバター',
        type: 'image',
        priority: 'high',
        required: true
      },
      {
        key: 'name',
        label: '氏名',
        type: 'text',
        priority: 'high',
        required: true,
        sortable: true,
        filterable: true
      },
      {
        key: 'email',
        label: 'メールアドレス',
        type: 'email',
        priority: 'medium',
        sortable: true,
        filterable: true
      }
    ]
  },
  {
    id: 'work-info',
    label: '職務情報',
    visible: true,
    resizable: true,
    width: { type: 'minmax', min: 180, max: 250 },
    items: [
      {
        key: 'department',
        label: '部署',
        type: 'text',
        priority: 'high',
        sortable: true,
        filterable: true
      },
      {
        key: 'position',
        label: '役職',
        type: 'text',
        priority: 'medium',
        sortable: true,
        filterable: true
      },
      {
        key: 'experience',
        label: '経験年数',
        type: 'number',
        priority: 'medium',
        sortable: true,
        suffix: '年'
      }
    ]
  },
  {
    id: 'skills',
    label: 'スキル・プロジェクト',
    visible: true,
    resizable: true,
    width: { type: 'minmax', min: 200, max: 400 },
    items: [
      {
        key: 'skills',
        label: 'スキル',
        type: 'text',
        priority: 'medium',
        formatter: (value: string[]) => Array.isArray(value) ? value.join(', ') : value
      },
      {
        key: 'projects',
        label: 'プロジェクト',
        type: 'text',
        priority: 'low',
        formatter: (value: string[]) => Array.isArray(value) ? value.join(', ') : value
      }
    ]
  },
  {
    id: 'performance',
    label: 'パフォーマンス',
    visible: true,
    resizable: true,
    width: { type: 'fixed', value: 150 },
    items: [
      {
        key: 'rating',
        label: '評価',
        type: 'number',
        priority: 'medium',
        sortable: true,
        align: 'center',
        formatter: (value: number) => `⭐ ${value.toFixed(1)}`
      },
      {
        key: 'status',
        label: 'ステータス',
        type: 'text',
        priority: 'high',
        sortable: true,
        filterable: true
      }
    ]
  },
  {
    id: 'salary-info',
    label: '給与情報',
    visible: true,
    resizable: true,
    width: { type: 'fixed', value: 120 },
    items: [
      {
        key: 'salary',
        label: '年収',
        type: 'number',
        priority: 'low',
        sortable: true,
        align: 'right',
        formatter: (value: number) => `¥${value.toLocaleString()}`,
        prefix: '¥'
      }
    ]
  },
  {
    id: 'contact-info',
    label: '連絡先',
    visible: false,  // デフォルトで非表示
    resizable: true,
    width: { type: 'minmax', min: 150, max: 200 },
    items: [
      {
        key: 'phone',
        label: '電話番号',
        type: 'phone',
        priority: 'low',
        filterable: true
      },
      {
        key: 'location',
        label: '勤務地',
        type: 'text',
        priority: 'low',
        sortable: true,
        filterable: true
      }
    ]
  },
  {
    id: 'dates',
    label: '日付情報',
    visible: false,  // デフォルトで非表示
    resizable: true,
    width: { type: 'minmax', min: 120, max: 180 },
    items: [
      {
        key: 'joinDate',
        label: '入社日',
        type: 'date',
        priority: 'low',
        sortable: true,
        formatter: (value: string) => new Date(value).toLocaleDateString('ja-JP')
      },
      {
        key: 'lastLogin',
        label: '最終ログイン',
        type: 'date',
        priority: 'low',
        sortable: true,
        formatter: (value: string) => {
          const date = new Date(value)
          const now = new Date()
          const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
          if (diffHours < 24) return `${diffHours}時間前`
          const diffDays = Math.floor(diffHours / 24)
          return `${diffDays}日前`
        }
      }
    ]
  },
  {
    id: 'manager-info',
    label: 'マネージャー',
    visible: false,  // デフォルトで非表示
    resizable: true,
    width: { type: 'fixed', value: 120 },
    items: [
      {
        key: 'manager',
        label: 'マネージャー',
        type: 'text',
        priority: 'low',
        sortable: true,
        filterable: true,
        placeholder: '未設定'
      }
    ]
  }
]

// =============================================================================
// 🎯 Demo Configuration Presets
// =============================================================================

export const demoPresets = {
  basic: {
    name: 'ベーシック表示',
    description: '基本的な情報のみ表示',
    columns: ['user-info', 'work-info', 'performance'],
    responsive: true
  },
  detailed: {
    name: '詳細表示',
    description: 'すべての情報を表示',
    columns: ['user-info', 'work-info', 'skills', 'performance', 'salary-info', 'contact-info', 'dates', 'manager-info'],
    responsive: true
  },
  minimal: {
    name: 'ミニマル表示',
    description: '必要最低限の情報のみ',
    columns: ['user-info', 'performance'],
    responsive: true
  }
}

export default {
  sampleUsers,
  sampleColumns,
  demoPresets
}