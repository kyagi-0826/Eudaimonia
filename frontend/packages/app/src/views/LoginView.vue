<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">🌟 Eudaimonia</h1>
          <p class="login-subtitle">ログインして始めましょう</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">ユーザーID</label>
            <BaseInput
              v-model="loginForm.userId"
              type="text"
              :class="{ 'form-input--error': errors.userId }"
              placeholder="ユーザーIDを入力"
              required
            />
            <span v-if="errors.userId" class="form-error">{{ errors.userId }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">パスワード</label>
            <BasePassword
              v-model="loginForm.password"
              :class="{ 'form-input--error': errors.password }"
              placeholder="パスワードを入力"
              required
            />
            <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input
                v-model="loginForm.rememberMe"
                type="checkbox"
                class="checkbox"
              />
              ログイン状態を保持する
            </label>
            <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">パスワードを忘れた方</a>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="login-button"
              :class="{ 'login-button--loading': isLoading }"
              :disabled="isLoading"
            >
              {{ isLoading ? 'ログイン中...' : 'ログイン' }}
            </button>
          </div>
        </form>

        <div class="login-footer">
          <p class="signup-text">
            アカウントをお持ちでない方は
            <a href="#" class="signup-link">新規登録</a>
          </p>
        </div>
      </div>
    </div>

    <!-- ローディング時のスピナーオーバーレイ -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner">⏳</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@components/BaseInput.vue'
import BasePassword from '@components/BasePassword.vue'

const router = useRouter()
const authStore = useAuthStore()

// フォームデータ
const loginForm = reactive({
  userId: '',
  password: '',
  rememberMe: false
})

// エラーメッセージ
const errors = reactive({
  userId: '',
  password: ''
})

// ローディング状態
const isLoading = ref(false)

// 簡単なバリデーション関数
const isRequired = (value: string) => {
  return value && value.trim().length > 0
}

const isValidUserId = (value: string) => {
  // ユーザーIDは3文字以上の英数字とアンダースコア、ハイフンを許可
  const userIdRegex = /^[a-zA-Z0-9_-]{3,20}$/
  return userIdRegex.test(value)
}

// バリデーション
const validateForm = (): boolean => {
  errors.userId = ''
  errors.password = ''

  if (!isRequired(loginForm.userId)) {
    errors.userId = 'ユーザーIDを入力してください'
    return false
  }

  if (!isRequired(loginForm.password)) {
    errors.password = 'パスワードを入力してください'
    return false
  }

  return true
}

// IDログイン処理
const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  // Piniaストアのエラーをクリア
  authStore.clearErrorMessage()

  isLoading.value = true

  try {
    const result = await authStore.login(loginForm.userId, loginForm.password)

    if (result.success) {
      console.log('ログイン成功!')
      
      // ログイン成功後はホームページにリダイレクト
      router.push('/')
    } else {
      // ストアからのエラーメッセージを表示
      errors.userId = result.error || 'ログインに失敗しました'
    }
  } catch (error) {
    console.error('ログインエラー:', error)
    errors.userId = 'ネットワークエラーが発生しました。再度お試しください。'
  } finally {
    isLoading.value = false
  }
}

// パスワードリセット処理（IDベースログインの場合、管理者に連絡するように案内）
const handleForgotPassword = async () => {
  if (!loginForm.userId) {
    errors.userId = 'パスワードリセット用のユーザーIDを入力してください'
    return
  }

  if (!isValidUserId(loginForm.userId)) {
    errors.userId = '有効なユーザーIDを入力してください'
    return
  }

  // IDベースのログインの場合、管理者への連絡を案内
  alert(`ユーザーID: ${loginForm.userId} のパスワードリセットについては、システム管理者にお問い合わせください。`)
}

// コンポーネントがマウントされた時の処理
onMounted(() => {
  // 既にログイン済みの場合はホームページにリダイレクト
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  position: relative;
}

.login-wrapper {
  width: 100%;
  max-width: 400px;
}

.login-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 1rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.login-subtitle {
  color: #718096;
  margin: 0;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input--error {
  border-color: #ef4444;
}

.form-input--error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  cursor: pointer;
}

.checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #667eea;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.forgot-password:hover {
  text-decoration: underline;
}

.form-actions {
  margin-top: 0.5rem;
}

.login-button {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  outline: none;
}

.login-button:hover:not(:disabled) {
  background-color: #5a67d8;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-button--loading {
  background-color: #5a67d8;
}

.login-footer {
  text-align: center;
  padding-top: 1rem;
}

.signup-text {
  color: #718096;
  margin: 0;
  font-size: 0.875rem;
}

.signup-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.signup-link:hover {
  text-decoration: underline;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  font-size: 2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* レスポンシブ対応 */
@media (max-width: 640px) {
  .login-container {
    padding: 0.5rem;
  }
  
  .login-title {
    font-size: 1.75rem;
  }
  
  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>