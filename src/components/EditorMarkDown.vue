<script setup>
import VMdEditor from '@kangc/v-md-editor'
import { userLoginAndRegisterService } from '@/api/register'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import hljs from 'highlight.js'
import { getCurrentInstance } from 'vue'
import { formDataUtil } from '@/utils/dataUtils'
const { proxy } = getCurrentInstance()
VMdEditor.use(githubTheme, {
  Hljs: hljs
})

const emit = defineEmits(['update:modelValue', 'htmlContent'])
const change = (markdownCotent, htmlContent) => {
  emit('update:modelValue', markdownCotent)
  emit('htmlContent', htmlContent)
}

const uploadImageHandler = async (event, insertImage, files) => {
  let params = { file: files[0] }
  params = formDataUtil(params)
  let {
    data: { data }
  } = await userLoginAndRegisterService('file/uploadImage', params)
  console.log(data)
  const url = proxy.globalInfo.imageUrl + data.fileName
  console.log(url)
  insertImage({
    url: url,
    desc: '图片'
  })
}

defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 500
  }
})
</script>

<template>
  <v-md-editor
    :model-value="modelValue"
    :height="height + 'px'"
    :disabled-menus="[]"
    :include-level="[1, 2, 3, 4, 5, 6]"
    @upload-image="uploadImageHandler"
    @change="change"
  ></v-md-editor>
</template>

<style lang="scss"></style>
