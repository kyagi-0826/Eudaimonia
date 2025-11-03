import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, type CustomUser, type CustomSession } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  // 状態管理
  const currentUser = ref<CustomUser | null>(null)
  const currentSession = ref<CustomSession | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  // 算出プロパティ
  const isAuthenticated = computed(() => !!currentUser.value)
  const displayName = computed(() => currentUser.value?.name || currentUser.value?.username || '')

  // ログイン
  const login = async (userId: string, password: string) => {
    isLoading.value = true
    errorMessage.value = null

    try {
      const { data: authData, error: authError } = await auth.signInWithId(userId, password)
      
      if (authError) {
        errorMessage.value = translateErrorMessage(authError.message)
        return { success: false, error: errorMessage.value }
      }

      if (authData?.user && authData?.session) {
        currentUser.value = authData.user
        currentSession.value = authData.session
        return { success: true }
      }

      errorMessage.value = 'ログインに失敗しました'
      return { success: false, error: errorMessage.value }
    } catch (error) {
      errorMessage.value = 'ネットワークエラーが発生しました'
      return { success: false, error: errorMessage.value }
    } finally {
      isLoading.value = false
    }
  }



  // ログアウト
  const logout = async () => {
    isLoading.value = true
    errorMessage.value = null

    try {
      const { error: authError } = await auth.signOut()
      
      if (authError) {
        errorMessage.value = translateErrorMessage(authError.message)
        return { success: false, error: errorMessage.value }
      }

      currentUser.value = null
      currentSession.value = null
      return { success: true }
    } catch (error) {
      errorMessage.value = 'ログアウトに失敗しました'
      return { success: false, error: errorMessage.value }
    } finally {
      isLoading.value = false
    }
  }

  // パスワードリセット
  const resetUserPassword = async (userId: string) => {
    isLoading.value = true
    errorMessage.value = null

    try {
      const { error: authError } = await auth.resetPassword(userId)
      
      if (authError) {
        errorMessage.value = translateErrorMessage(authError.message)
        return { success: false, error: errorMessage.value }
      }

      return { success: true }
    } catch (error) {
      errorMessage.value = 'パスワードリセットに失敗しました'
      return { success: false, error: errorMessage.value }
    } finally {
      isLoading.value = false
    }
  }

  // 認証状態を初期化
  const initializeAuthState = async () => {
    try {
      const { data: userData } = await auth.getCurrentUser()
      if (userData.user) {
        currentUser.value = userData.user
      }
    } catch (error) {
      console.error('認証の初期化に失敗しました:', error)
    }
  }

  // 認証状態の変更を監視
  const setupAuthStateListener = () => {
    auth.onAuthStateChange((event, updatedSession) => {
      if (event === 'SIGNED_IN' && updatedSession) {
        currentUser.value = updatedSession.user
        currentSession.value = updatedSession
      } else if (event === 'SIGNED_OUT') {
        currentUser.value = null
        currentSession.value = null
      }
    })
  }

  // エラーメッセージを日本語に変換
  const translateErrorMessage = (errorText: string) => {
    const errorTranslations: Record<string, string> = {
      'ユーザーIDまたはパスワードが正しくありません': 'ユーザーIDまたはパスワードが正しくありません',
      'ログイン処理中にエラーが発生しました': 'ログイン処理中にエラーが発生しました',
      'ログアウト処理中にエラーが発生しました': 'ログアウト処理中にエラーが発生しました',
      'パスワードリセットについては、システム管理者にお問い合わせください': 'パスワードリセットについては、システム管理者にお問い合わせください',
      'Invalid login credentials': 'ユーザーIDまたはパスワードが正しくありません',
      'User not found': 'ユーザーが見つかりません',
      'Password should be at least 6 characters': 'パスワードは6文字以上で入力してください'
    }
    
    return errorTranslations[errorText] || 'エラーが発生しました。再度お試しください。'
  }

  // エラーメッセージをクリア
  const clearErrorMessage = () => {
    errorMessage.value = null
  }

  return {
    // 状態管理
    currentUser,
    currentSession,
    isLoading,
    errorMessage,
    // 算出プロパティ
    isAuthenticated,
    displayName,
    // アクション
    login,
    logout,
    resetUserPassword,
    initializeAuthState,
    setupAuthStateListener,
    clearErrorMessage
  }
})