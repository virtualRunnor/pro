<script setup>
const emit = defineEmits(['loadDate'])
const handleCurrentChange = (page) => {
  props.dataSource.pageNo = page
  emit('loadDate', page)
}
const props = defineProps({
  dataSource: {
    type: Object
  },
  loading: {
    type: Boolean
  },
  noDataMsg: {
    type: String,
    default: '空空如也'
  }
})
</script>

<template>
  <div
    v-if="!loading && dataSource.list != null && dataSource.list.length == 0"
  >
    <NodataCom :msg="noDataMsg"></NodataCom>
  </div>
  <div class="skeleton" v-if="loading">
    <el-skeleton :row="2" animated></el-skeleton>
  </div>
  <div v-for="item in dataSource.list" :key="item.articleId">
    <slot :data="item"></slot>
  </div>
  <div class="pagination" v-if="dataSource.pageTotal > 1">
    <el-pagination
      :current-page="dataSource.pageNo"
      background
      :page-size="15"
      layout="prev, pager, next"
      :total="dataSource.totalCount"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<style lang="scss">
.pagination {
  padding: 10px 0px 10px 10px;
}
.skeleton {
  padding: 15px;
}
</style>
