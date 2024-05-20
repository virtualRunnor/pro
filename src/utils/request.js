import axios from 'axios'
import { ElMessage } from 'element-plus'

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    'X-Requested-With': 'XMLHttpRequest'
  }
})
//请求拦截器
instance.interceptors.request.use(
  (config) => {
    //这里设置errCallback
    if (config.errCallback) {
      config.errCallbackInstance = config.errCallback
      delete config.errCallback
    }
    return config
  },
  (err) => {
    ElMessage.error('请求发送失败')
    return Promise.reject(err)
  }
)

//响应拦截器
instance.interceptors.response.use(
  (res) => {
    if (res.data.code === 200) {
      return res
    } else if (res.code === 901) {
      ElMessage.error('登录超时')
    } else {
      //这里调用errCallback
      if (res.config.errCallbackInstance) {
        res.config.errCallbackInstance(res)
      } else {
        ElMessage.error(res.data.info || '服务异常')
      }
    }
    return Promise.reject(res)
  },
  (err) => {
    ElMessage.error(err.response.data.info || '服务异常')
    return Promise.reject(err)
  }
)
export default instance
