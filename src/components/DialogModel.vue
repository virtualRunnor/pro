<script setup>
const emit = defineEmits(['soncloseDia'])
const close = () => {
  emit('soncloseDia')
}
defineProps({
  showClose: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: '标题'
  },
  width: {
    type: String,
    default: '30%'
  },
  topHight: {
    type: String,
    default: '30px'
  },
  show: {
    type: Boolean,
    default: false
  },
  buttons: {
    type: Array
  },
  showCancel: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <el-dialog
    :modelValue="show"
    :title="title"
    :show-close="showClose"
    class="cust-dialog"
    :width="width"
    :top="topHight"
    :close-on-click-modal="false"
    @close="close"
  >
    <div class="dialog-body">
      <slot></slot>
    </div>
    <template v-if="buttons?.length > 0">
      <div class="dialog-footer">
        <el-button link @click="close" v-if="showCancel">取消</el-button>
        <el-button
          v-for="btn in buttons"
          :key="btn.id"
          :type="btn.type"
          @click="btn.click"
        >
          {{ btn.text }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.cust-dialog {
  .el-dialog__body {
    padding: 0px;
  }
  .dialog-body {
    border-top: 1px solid#ddd;
    border-bottom: 1px solid #ddd;
    padding: 15px;
    min-height: 100px;
    max-height: calc(100vh - 200px);
    overflow: auto;
  }
  .dialog-footer {
    text-align: right;
    padding: 10px 20px;
  }
}
</style>
