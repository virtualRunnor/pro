import { createApp } from 'vue'
import App from './App.vue'
//引入cookies
import VueCookies from 'vue-cookies'
//引入element plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
//我们使用sass 所以这里将base.css 改成base.scss
import '@/assets/base.scss'
//图标 图标在附件中
import '@/assets/icon/iconfont.css'
import router from './router'
//导入pinia
import pinia from './stores'

const app = createApp(App)
app.use(ElementPlus)

//全局组件
import Dialog from '@/components/DialogModel.vue'
app.component('Dialog-com', Dialog)

app.config.globalProperties.VueCookies = VueCookies
app.config.globalProperties.globalInfo = {
  bodyWidth: 1300,
  imageUrl: '/api/file/getImage/'
}

app.use(router)
app.use(pinia)
app.mount('#app')
