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

    <!-- BaseTable デモセクション -->
    <div class="demo-section">
      <div class="demo-card">
        <h2 class="demo-title">📊 BaseTable システム デモ</h2>
        <p class="demo-description">
          高機能なテーブルコンポーネントシステムを体験してください！
          レスポンシブ対応、CRUD操作、一括処理、リアルタイム検索など、
          エンタープライズレベルの機能を実装しています。
        </p>
        <div class="demo-features">
          <span class="demo-tag">✨ レスポンシブデザイン</span>
          <span class="demo-tag">🔍 高速検索</span>
          <span class="demo-tag">📝 CRUD操作</span>
          <span class="demo-tag">📱 モバイル最適化</span>
        </div>
        <RouterLink to="/listview" class="btn btn-demo">
          リストビューを体験 🚀
        </RouterLink>
      </div>
    </div>

    <div class="actions">
      <RouterLink to="/about" class="btn btn-primary">
        アバウト ℹ️
      </RouterLink>
      <RouterLink to="/components" class="btn btn-secondary">
        コンポーネント 🧩
      </RouterLink>
      <RouterLink to="/listview" class="btn btn-highlight">
        リストビュー 📋
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
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-highlight {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-demo {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
  margin-top: 1.5rem;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* デモセクションのスタイル */
.demo-section {
  margin: 4rem 0;
}

.demo-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.demo-title {
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.demo-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.demo-features {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.demo-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
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

  .demo-title {
    font-size: 1.5rem;
  }

  .demo-description {
    font-size: 1rem;
  }

  .demo-features {
    gap: 0.5rem;
  }

  .demo-tag {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }

  .actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 200px;
    text-align: center;
  }
}
</style>