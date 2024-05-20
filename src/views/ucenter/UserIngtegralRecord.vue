<script setup>
import { ref, reactive, nextTick } from 'vue'
import { userLoginAndRegisterService } from '@/api/register'
const formData = ref({})
const formDataRef = ref()

const api = {
  loadUserIntegralRecord: '/ucenter/loadUserIntegralRecord'
}

const dialogConfig = reactive({
  show: false,
  title: '查看用户积分记录',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: () => {
        dialogConfig.show = false
      }
    }
  ]
})

const showRecord = () => {
  dialogConfig.show = true
  nextTick(() => {
    formDataRef.value.resetFields()
    loadRecord()
  })
}

defineExpose({ showRecord })
const recordInfo = ref({})
const loading = ref(false)
const loadRecord = async (page, type) => {
  if (type === 1) {
    recordInfo.value.pageNo = type
  } else {
    recordInfo.value.pageNo = page
  }
  loading.value = true
  let params = {
    pageNo: recordInfo.value.pageNo
  }
  if (formData.value.createTimeRange) {
    params.createTimeStart = formData.value.createTimeRange[0]
    params.createTimeEnd = formData.value.createTimeRange[1]
  }
  const {
    data: { data }
  } = await userLoginAndRegisterService(api.loadUserIntegralRecord, params)
  recordInfo.value = data
  loading.value = false
}
</script>

<template>
  <DialogModel
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="400px"
    :showCancel="false"
    @close="dialogConfig.show = false"
  >
    <el-form
      :model="formData"
      ref="formDataRef"
      label-width="40px"
      @submit.prevent
    >
      <!--input输入-->
      <el-form-item label="日期" prop="createTimeRange">
        <el-date-picker
          v-model="formData.createTimeRange"
          type="daterange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="loadRecord(page, 1)"
        ></el-date-picker>
      </el-form-item>
    </el-form>
    <div class="data-item">
      <div class="record-type">类型</div>
      <div class="integral">积分</div>
      <div class="create-time">时间</div>
    </div>
    <DataList
      :loading="loading"
      :dataSource="recordInfo"
      @loadDate="loadRecord"
      noDataMsg="暂无相关记录"
    >
      <template #default="{ data }">
        <div class="data-item">
          <div class="record-type">{{ data.operTypeName }}</div>
          <div
            :style="{ paddingLeft: '10px' }"
            :class="['integral', data.integral > 0 ? 'add' : 'reduce']"
          >
            {{ data.integral }}
          </div>
          <div :style="{ paddingLeft: '20px' }" class="create-time">
            {{ data.createTime }}
          </div>
        </div>
      </template>
    </DataList>
  </DialogModel>
</template>

<style lang="scss">
.data-item {
  display: flex;
  border-bottom: 1px solid #ddd;
  padding: 5px 0px;
  .add {
    color: red;
  }
  .reduce {
    color: green;
  }
  .record-type {
    width: 120px;
  }
  .interal {
    width: 120px;
  }
  .create-time {
    text-align: center;
    flex: 1;
  }
}
</style>
