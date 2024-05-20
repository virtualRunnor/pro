<script setup>
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

const loaclFile = ref(null)

const emit = defineEmits(['update:modelValue'])
const uploadImage = async (file) => {
  file = file.file
  let img = new FileReader()
  img.readAsDataURL(file)
  img.onload = ({ target }) => {
    loaclFile.value = target.result
  }
  emit('update:modelValue', file)
}

defineProps({
  imageUrlPrefix: {
    type: String
  },
  modelValue: {
    type: Object,
    default: null
  }
})
</script>

<template>
  <div class="cover-upload">
    <el-upload
      name="file"
      :show-file-list="false"
      accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
      :multiple="false"
      :http-request="uploadImage"
    >
      <div class="cover-upload-btn">
        <template v-if="loaclFile">
          <img :src="loaclFile" alt="" />
        </template>
        <template v-else>
          <img
            :src="
              (imageUrlPrefix ? imageUrlPrefix : proxy.globalInfo.imageUrl) +
              modelValue.imageUrl
            "
            alt=""
            v-if="modelValue && modelValue.imageUrl"
          />
          <span class="iconfont icon-add" v-else></span>
        </template>
      </div>
    </el-upload>
  </div>
</template>

<style lang="scss">
.cover-upload {
  .cover-upload-btn {
    background: #dfd9d9;
    width: 150px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    .iconfont {
      font-size: 50px;
      color: #cac5c5;
    }
    img {
      width: 100%;
    }
  }
}
</style>
