<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero-title">Eudaimonia App へようこそ！🌟</h1>
      <p class="hero-subtitle">
        Vue 3 + TypeScript + Pinia + Vue Router で構築された
        モダンなフロントエンドアプリケーションです
      </p>
    </div>

    <div class="features">
      <div class="feature-grid">
        <div class="feature-card">
          <h3>⚡ Vue 3</h3>
          <p>最新の Composition API と `&lt;script setup&gt;` 構文を使用</p>
        </div>
        <div class="feature-card">
          <h3>🔧 TypeScript</h3>
          <p>型安全な開発で品質の高いコードを実現</p>
        </div>
        <div class="feature-card">
          <h3>🗃️ Pinia</h3>
          <p>Vue 3 公式の状態管理ライブラリでデータ管理</p>
        </div>
        <div class="feature-card">
          <h3>🛣️ Vue Router</h3>
          <p>SPA のルーティングを簡単に管理</p>
        </div>
      </div>
    </div>

    <div class="actions">
      <RouterLink to="/about" class="btn btn-primary">
        アバウト ℹ️
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.home {
  text-align: center;
}

.hero {
  padding: 3rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.features {
  margin: 3rem 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.6;
}

.actions {
  margin: 3rem 0;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>