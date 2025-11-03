<template>
  <div class="components-demo">
    <h1>Components Library Demo 🎨</h1>
    
    <!-- Button Demo -->
    <section class="demo-section">
      <h2>BaseButton コンポーネント</h2>
      <div class="demo-grid">
        <div class="demo-item">
          <h3>バリエーション</h3>
          <div class="button-group">
            <BaseButton variant="primary">Primary</BaseButton>
            <BaseButton variant="secondary">Secondary</BaseButton>
            <BaseButton variant="success">Success</BaseButton>
            <BaseButton variant="danger">Danger</BaseButton>
            <BaseButton variant="warning">Warning</BaseButton>
          </div>
        </div>
        
        <div class="demo-item">
          <h3>サイズ</h3>
          <div class="button-group">
            <BaseButton size="small">Small</BaseButton>
            <BaseButton size="medium">Medium</BaseButton>
            <BaseButton size="large">Large</BaseButton>
          </div>
        </div>
        
        <div class="demo-item">
          <h3>アウトライン & 状態</h3>
          <div class="button-group">
            <BaseButton outlined>Outlined</BaseButton>
            <BaseButton disabled>Disabled</BaseButton>
            <BaseButton :loading="buttonLoading" @click="toggleLoading">
              {{ buttonLoading ? 'Loading...' : 'Click me!' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Card Demo -->
    <section class="demo-section">
      <h2>BaseCard コンポーネント</h2>
      <div class="demo-grid">
        <BaseCard title="基本カード" subtitle="シンプルなカードの例">
          <p>これは基本的なカードの内容です。</p>
        </BaseCard>
        
        <BaseCard shadow="large" hoverable>
          <template #header>
            <h3>カスタムヘッダー ✨</h3>
          </template>
          <p>大きなシャドウとホバー効果付きのカード</p>
          <template #footer>
            <BaseButton size="small">アクション</BaseButton>
          </template>
        </BaseCard>
        
        <BaseCard padding="large" border>
          <h3>大きなパディング</h3>
          <p>パディングが大きなカードです。</p>
        </BaseCard>
      </div>
    </section>

    <!-- Input Demo -->
    <section class="demo-section">
      <h2>BaseInput コンポーネント</h2>
      <div class="demo-grid">
        <div class="demo-item">
          <BaseInput
            v-model="textInput"
            label="テキスト入力"
            placeholder="何か入力してください"
            helper-text="ヘルパーテキストの例"
          />
        </div>
        
        <div class="demo-item">
          <BaseInput
            v-model="emailInput"
            type="email"
            label="メールアドレス"
            placeholder="example@email.com"
            required
            :error-message="emailError"
          />
        </div>
        
        <div class="demo-item">
          <BaseInput
            v-model="disabledInput"
            label="無効化された入力"
            disabled
          />
        </div>
      </div>
    </section>

    <!-- Spinner Demo -->
    <section class="demo-section">
      <h2>BaseSpinner コンポーネント</h2>
      <div class="demo-grid">
        <div class="demo-item">
          <h3>Circular</h3>
          <BaseSpinner type="circular" text="読み込み中..." />
        </div>
        
        <div class="demo-item">
          <h3>Dots</h3>
          <BaseSpinner type="dots" color="#28a745" :size="50" />
        </div>
        
        <div class="demo-item">
          <h3>Pulse</h3>
          <BaseSpinner type="pulse" color="#dc3545" :size="60" />
        </div>
      </div>
    </section>

    <!-- Modal Demo -->
    <section class="demo-section">
      <h2>BaseModal コンポーネント</h2>
      <div class="demo-grid">
        <div class="demo-item">
          <BaseButton @click="showModal = true">モーダルを開く</BaseButton>
        </div>
      </div>
    </section>

    <!-- Modal -->
    <BaseModal
      v-model="showModal"
      title="デモモーダル"
      size="medium"
    >
      <p>これはモーダルの内容です。</p>
      <p>複数行のテキストを表示できます。</p>
      
      <template #footer>
        <BaseButton variant="secondary" @click="showModal = false">
          キャンセル
        </BaseButton>
        <BaseButton variant="primary" @click="showModal = false">
          OK
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  BaseButton,
  BaseCard,
  BaseInput,
  BaseModal,
  BaseSpinner
} from 'components'

// 型安全なコンポーネント使用
// 適切な型定義により、anyアサーションは不要

// State
const buttonLoading = ref(false)
const textInput = ref('')
const emailInput = ref('')
const disabledInput = ref('無効化されたテキスト')
const showModal = ref(false)

// Computed
const emailError = computed(() => {
  if (emailInput.value && !emailInput.value.includes('@')) {
    return '有効なメールアドレスを入力してください'
  }
  return ''
})

// Methods
const toggleLoading = () => {
  buttonLoading.value = true
  setTimeout(() => {
    buttonLoading.value = false
  }, 2000)
}
</script>

<style scoped>
.components-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.components-demo h1 {
  text-align: center;
  margin-bottom: 3rem;
  color: #2c3e50;
}

.demo-section {
  margin-bottom: 4rem;
}

.demo-section h2 {
  margin-bottom: 2rem;
  color: #34495e;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.demo-item {
  padding: 1rem;
}

.demo-item h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.1rem;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

@media (max-width: 768px) {
  .components-demo {
    padding: 1rem;
  }
  
  .demo-grid {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>