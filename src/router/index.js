import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  { path: '/login', component: () => import('../views/login.vue') },
  { path: '/register', component: () => import('../views/register.vue') },
  {
    path: '/index',
    component: () => import('../views/home/index.vue'),
    redirect: '/item',
    children: [
      { path: '/item', component: () => import('../views/home/item.vue') },
      { path: '/my', component: () => import('../views/home/my.vue') },
      { path: '/upload', component: () => import('../views/home/upload.vue') },
      { path: '/message', component: () => import('../views/home/message.vue') }
    ]
  },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  // 访问登录则直接放行 
  if (to.path === "/login" || to.path === "/register") {
    return next()
  }

  // 未能登录 转跳至/login
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  if (!userInfo) {
    return next("")
  }
  // 已经登录 直接放行
  next()
})

export default router
