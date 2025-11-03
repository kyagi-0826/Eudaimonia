import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
// コンポーネントライブラリのCSS読み込み
import '../../components/dist/style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 認証ストアを初期化
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
authStore.initializeAuthState()
authStore.setupAuthStateListener()

app.mount('#app')