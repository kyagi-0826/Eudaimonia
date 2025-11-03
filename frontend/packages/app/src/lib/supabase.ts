import { createClient } from '@supabase/supabase-js'

// Supabaseの設定
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Supabaseクライアントを作成
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// カスタム認証システム（Supabase認証を使用しない）
export interface CustomUser {
  id: string
  username: string
  email: string
  name: string
  created_at: string
}

export interface AuthResponse {
  user: CustomUser | null
  session: CustomSession | null
}

export interface CustomSession {
  access_token: string
  user: CustomUser
  expires_at: number
}

// 認証関連のユーティリティ関数
export const auth = {
  // IDでのログイン（カスタム認証 - Supabase認証システムを使わない）
  async signInWithId(userId: string, password: string) {
    try {
      // Userテーブルから直接ユーザー情報を取得して認証
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('id', userId)
        .eq('password', password) // 実際の実装ではハッシュ化されたパスワードと比較
        .single()
      
      if (userError || !userData) {
        return { 
          data: null, 
          error: { message: 'ユーザーIDまたはパスワードが正しくありません' }
        }
      }

      // カスタムセッションを作成
      const customUser: CustomUser = {
        id: userData.id,
        username: userData.id,
        email: userData.email || '',
        name: userData.name || userData.id,
        created_at: userData.created_at || new Date().toISOString()
      }

      const session: CustomSession = {
        access_token: `custom_token_${Date.now()}_${userData.id}`,
        user: customUser,
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24時間後に期限切れ
      }

      // ローカルストレージに保存
      localStorage.setItem('auth_session', JSON.stringify(session))

      return { 
        data: { user: customUser, session }, 
        error: null 
      }
    } catch (error) {
      console.error('ログインエラー:', error)
      return { 
        data: null, 
        error: { message: 'ログイン処理中にエラーが発生しました' }
      }
    }
  },



  // ログアウト
  async signOut() {
    try {
      localStorage.removeItem('auth_session')
      return { error: null }
    } catch (error) {
      return { error: { message: 'ログアウト処理中にエラーが発生しました' } }
    }
  },

  // 現在のユーザーを取得
  getCurrentUser() {
    try {
      const sessionStr = localStorage.getItem('auth_session')
      if (!sessionStr) {
        return { data: { user: null }, error: null }
      }

      const session: CustomSession = JSON.parse(sessionStr)
      
      // セッションの有効期限をチェック
      if (Date.now() > session.expires_at) {
        localStorage.removeItem('auth_session')
        return { data: { user: null }, error: null }
      }

      return { data: { user: session.user }, error: null }
    } catch (error) {
      localStorage.removeItem('auth_session')
      return { data: { user: null }, error: null }
    }
  },

  // 認証状態の変更を監視（カスタム実装）
  onAuthStateChange(callback: (event: string, session: CustomSession | null) => void) {
    // 初期状態をチェック
    const currentUser = this.getCurrentUser()
    if (currentUser.data.user) {
      const sessionStr = localStorage.getItem('auth_session')
      const session = sessionStr ? JSON.parse(sessionStr) : null
      callback('SIGNED_IN', session)
    } else {
      callback('SIGNED_OUT', null)
    }

    // ストレージの変更を監視
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_session') {
        if (e.newValue) {
          const session = JSON.parse(e.newValue)
          callback('SIGNED_IN', session)
        } else {
          callback('SIGNED_OUT', null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // クリーンアップ関数を返す
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  },

  // パスワードリセット（管理者連絡案内）
  async resetPassword(userId: string) {
    // カスタム認証システムの場合、管理者への連絡を案内
    return { 
      data: null, 
      error: { message: 'パスワードリセットについては、システム管理者にお問い合わせください' } 
    }
  }
}

// データベース関連のユーティリティ
export const db = {
  // テーブルからデータを取得
  from(table: string) {
    return supabase.from(table)
  },

  // リアルタイム購読
  subscribe(table: string, callback: (payload: any) => void) {
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe()
  }
}

export default supabase