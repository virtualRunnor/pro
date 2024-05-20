import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const loginUserInfo = ref({})
  const setLoginUserInfo = (obj) => {
    loginUserInfo.value = obj
  }
  const messageCountInfo = ref({})
  const setMessageCountInfo = (obj) => {
    messageCountInfo.value = obj
  }
  const readMessage = (value) => {
    messageCountInfo.value.total =
      messageCountInfo.value.total - messageCountInfo.value[value]
    messageCountInfo.value[value] = 0
  }
  return {
    loginUserInfo,
    setLoginUserInfo,
    messageCountInfo,
    setMessageCountInfo,
    readMessage
  }
})
