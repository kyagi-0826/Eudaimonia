import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: 'ホーム'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: 'アバウト'
    }
  },
  {
    path: '/components',
    name: 'Components',
    component: () => import('../views/ComponentsView.vue'),
    meta: {
      title: 'コンポーネント'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ページタイトルを設定
router.beforeEach((to) => {
  document.title = to.meta.title as string || 'Eudaimonia App'
})

export default router