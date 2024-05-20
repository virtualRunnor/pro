import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/LayoutPage.vue'),
      redirect: '/forum',
      children: [
        { path: '/forum', component: () => import('@/views/HomePage.vue') },
        {
          path: '/forum/:pBoardId',
          name: '一级版块',
          component: () => import('@/views/HomePage.vue')
        },
        {
          path: '/forum/:pBoardId/:boardId/',
          name: '二级版块',
          component: () => import('@/views/HomePage.vue')
        },
        {
          path: '/user/:userId',
          name: '用户信息',
          component: () => import('@/views/ucenter/UserCenter.vue')
        },
        {
          path: '/post/:articleId/',
          name: '文章详情',
          component: () => import('@/views/forum/ArticleDetail.vue')
        },
        {
          path: '/newPost/',
          name: '发布文章',
          component: () => import('@/views/forum/EditPost.vue')
        },
        {
          path: '/editPost/:articleId',
          name: '编辑文章',
          component: () => import('@/views/forum/EditPost.vue')
        },
        {
          path: '/user/message/:type',
          name: '消息中心',
          component: () => import('@/views/ucenter/MessageList.vue')
        },
        {
          path: '/search',
          name: '搜索',
          component: () => import('@/views/Search.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: '错误页',
      component: () => import('@/views/Error404.vue')
    }
  ]
})

export default router
