<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import {
  onBeforeUnmount,
  ref,
  shallowRef,
  inject,
  getCurrentInstance
} from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { ElMessage } from 'element-plus'
const showLoginPanel = inject('useShowPanel')
const { proxy } = getCurrentInstance()
const mode = ref('default')
const editorRef = shallowRef()
const toolbarConfig = {
  excludeKeys: [
    'uploadVideo' //排除菜单组，写菜单组KeY的值即可
  ]
}
const emit = defineEmits(['update:modelValue'])
const onChange = (edior) => {
  emit('update:modelValue', edior.getHtml())
}

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const editorConfig = {
  placeholder: '请输入内容...',
  excludeKeys: ['uploadVideo'],
  MENU_CONF: {
    uploadImage: {
      maxFileSize: 3 * 1024 * 1024,
      server: '/api/file/uploadImage',
      filedName: 'file',
      customInsert(responseData, insertFn) {
        //正常请求
        if (responseData.code == 200) {
          insertFn(
            proxy.globalInfo.imageUrl + responseData.data.fileName,
            '',
            ''
          )
          return
        } else if (responseData.code == 901) {
          //登录超时
          showLoginPanel(1)
          return
        }
        ElMessage.error(responseData.info)
      }
    }
  }
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
  <div class="editor-html">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      :style="{ height: height + 'px', ' overflow-y': 'hidden' }"
      :model-value="modelValue"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="onChange"
    />
  </div>
</template>

<style lang="scss">
.editor-html {
  z-index: 3;
  flex: 1;
  border: 1px solid #ddd;
}
</style>
