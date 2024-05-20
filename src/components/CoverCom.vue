<script setup>
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
defineProps({
  cover: {
    type: String
  },
  width: {
    type: Number,
    defualt: 60
  }
})
</script>

<template>
  <div class="cover" :style="{ width: width + 'px', height: width + 'px' }">
    <el-image
      :style="{ width: width + 'px', height: width + 'px' }"
      fit="scale-down"
      loading="lazy"
      :src="proxy.globalInfo.imageUrl + cover"
    >
    </el-image>
  </div>
</template>

<style lang="scss">
.cover {
  background: #ddd;
  border-radius: 5px;
  overflow: hidden;
}
</style>
