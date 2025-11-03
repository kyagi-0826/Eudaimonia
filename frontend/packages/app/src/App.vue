<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <h1 class="nav-title">Eudaimonia App 🌟</h1>
        <ul class="nav-menu">
          <li class="nav-item">
            <RouterLink to="/" class="nav-link">ホーム</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/about" class="nav-link">アバウト</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/components" class="nav-link">コンポーネント</RouterLink>
          </li>
          <li v-if="!authStore.isAuthenticated" class="nav-item">
            <RouterLink to="/login" class="nav-link">ログイン</RouterLink>
          </li>
          <li v-if="authStore.isAuthenticated" class="nav-item">
            <span class="nav-text">ようこそ、{{ authStore.displayName }}さん</span>
          </li>
          <li v-if="authStore.isAuthenticated" class="nav-item">
            <button @click="handleLogout" class="nav-button">ログアウト</button>
          </li>
        </ul>
      </div>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>

    <footer class="footer">
      <p>&copy; 2025 Eudaimonia App - Vue 3 + TypeScript + Pinia 🚀</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// ログアウト処理
const handleLogout = async () => {
  const result = await authStore.logout()
  if (result.success) {
    router.push('/login')
  }
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.navbar {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-title {
  margin: 0;
  font-size: 1.5rem;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-item {
  margin: 0;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: #34495e;
}

.nav-text {
  color: #bdc3c7;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.nav-button {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.3s;
}

.nav-button:hover {
  background: #c0392b;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.footer {
  background-color: #ecf0f1;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

.footer p {
  margin: 0;
  color: #7f8c8d;
}
</style>