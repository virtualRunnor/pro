import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSysStore = defineStore('sys', () => {
  const sysSeting = ref({})
  const saveSysSetting = (value) => {
    sysSeting.value = value
  }
  return {
    sysSeting,
    saveSysSetting
  }
})
