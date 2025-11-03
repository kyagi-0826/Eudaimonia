<template>
  <div class="about">
    <div class="card">
      <h1 class="card-title">Eudaimonia App について</h1>
      
      <section class="section">
        <h2>🎯 プロジェクトの目的</h2>
        <p>
          Eudaimonia App は、モダンなフロントエンド技術を使用して構築された
          デモンストレーション用のアプリケーションです。
          Vue 3 のエコシステムを活用し、型安全で保守性の高いコードを実現しています。
        </p>
      </section>

      <section class="section">
        <h2>🛠️ 使用技術</h2>
        <div class="tech-list">
          <div class="tech-item">
            <strong>Vue 3</strong>
            <span>{{ vueVersion }}</span>
          </div>
          <div class="tech-item">
            <strong>TypeScript</strong>
            <span>型安全な JavaScript</span>
          </div>
          <div class="tech-item">
            <strong>Pinia</strong>
            <span>状態管理ライブラリ</span>
          </div>
          <div class="tech-item">
            <strong>Vue Router</strong>
            <span>SPA ルーティング</span>
          </div>
          <div class="tech-item">
            <strong>Vite</strong>
            <span>高速ビルドツール</span>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>✨ 特徴</h2>
        <ul class="feature-list">
          <li>🔥 Composition API を使用したモダンな Vue 3 開発</li>
          <li>📝 TypeScript による型安全な開発</li>
          <li>🗃️ Pinia による効率的な状態管理</li>
          <li>🎨 レスポンシブデザイン対応</li>
          <li>⚡ Vite による高速な開発体験</li>
        </ul>
      </section>

      <div class="actions">
        <RouterLink to="/" class="btn btn-primary">ホームに戻る</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { version } from 'vue'

const vueVersion = version
</script>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
}

.section {
  margin: 2rem 0;
}

.section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.section p {
  line-height: 1.8;
  color: #555;
  margin-bottom: 1rem;
}

.tech-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.tech-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.tech-item strong {
  color: #2c3e50;
}

.tech-item span {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 0.5rem 0;
  color: #555;
  border-bottom: 1px solid #eee;
}

.feature-list li:last-child {
  border-bottom: none;
}

.actions {
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .tech-list {
    grid-template-columns: 1fr;
  }
  
  .tech-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}
</style>