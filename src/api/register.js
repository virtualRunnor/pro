import request from '@/utils/request.js'

export const userLoginAndRegisterService = (url, obj, errCallback) => {
  return request.post(url, obj, errCallback)
}
