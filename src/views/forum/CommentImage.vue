<script setup>
defineProps({
  src: {
    type: String
  },
  imageList: {
    type: Array
  }
})
</script>

<template>
  <el-image
    class="comment-img"
    :src="src"
    :zoom-rate="1.2"
    :preview-src-list="imageList ? imageList : [src]"
    :initial-index="0"
    fit="scale-down"
    loading="lazy"
    hide-on-click-modal
  />
</template>

<style lang="scss">
.comment-img {
  width: 80px;
  height: 80px;
  background: #eee;
}
</style>
