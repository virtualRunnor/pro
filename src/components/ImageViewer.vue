<script setup>
import { ref } from 'vue'
const previewImagIndex = ref(null)
const closerImgViewer = () => {
  startScoll()
  previewImagIndex.value = null
}
const showImagePreview = (index) => {
  stopScoll()
  previewImagIndex.value = index
}

//禁止滚动
const stopScoll = () => {
  document.body.style.overflow = 'hidden'
}

//开启滚动
const startScoll = () => {
  document.body.style.overflow = 'auto'
}
defineExpose({ showImagePreview })
defineProps({
  imageList: {
    type: Array
  }
})
</script>

<template>
  <div class="image-viewer">
    <el-image-viewer
      v-if="previewImagIndex != null"
      @close="closerImgViewer"
      hide-on-click-modal
      :url-list="imageList"
      :initial-index="previewImagIndex"
    ></el-image-viewer>
  </div>
</template>

<style lang="scss" scoped>
.image-viewer {
  .el-image-viewer__mask {
    opacity: 0.7;
  }
}
</style>
