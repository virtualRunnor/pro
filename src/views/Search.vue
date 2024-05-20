<script setup>
import { ref, getCurrentInstance, onMounted } from 'vue'
import ArticleItem from '@/views/components/ArticleItem.vue'
import { userLoginAndRegisterService } from '@/api/register'
import { useBoardStore } from '@/stores'
const boardStore = useBoardStore()
const { proxy } = getCurrentInstance()
const api = {
  searchApi: '/forum/search'
}
const formData = ref({})
const formDataRef = ref()
const rules = {
  keyword: [
    { required: true, message: '请输入关键字' },
    { min: 3, message: '至少输入三个字' }
  ]
}

const searchPanelHeight = (window.innerHeight - 60 - 140 - 60) / 2

//开始搜索
const startSearch = ref(false)
const startSearchHandler = () => {
  startSearch.value = true
}
const endSearchHandler = () => {
  startSearch.value = false
}

const loading = ref(false)
const articleInfoList = ref({})
const search = async () => {
  await formDataRef.value.validate()
  loading.value = true
  let params = {
    keyword: formData.value.keyword
  }
  console.log(params)
  const {
    data: { data }
  } = await userLoginAndRegisterService(api.searchApi, params)
  let list = data.list
  list.forEach((elment) => {
    elment.title = elment.title.replace(
      params.keyword,
      `<span class="sub-sub-item">${params.keyword}</span>`
    )
  })
  articleInfoList.value = data
  loading.value = false
}

const changeInput = () => {
  if (formData.value.keyword == '') {
    articleInfoList.value = {}
  }
}

onMounted(() => {
  boardStore.setActivepBoardId(-1)
})
</script>

<template>
  <div
    class="page-container search-body"
    :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
  >
    <div
      class="search-panel"
      :style="{ 'padding-top': startSearch ? '0px' : searchPanelHeight + 'px' }"
    >
      <el-form :model="formData" :rules="rules" ref="formDataRef">
        <!--input输入-->
        <el-form-item prop="keyword">
          <el-input
            size="large"
            clearable
            placeholder="求输入你想要查找的关键词"
            v-model.trim="formData.keyword"
            @keyup.enter="search"
            @focus="startSearchHandler"
            @change="changeInput"
            @blur="endSearchHandler"
          >
            <template #suffix>
              <span
                class="iconfont icon-search"
                @click="search"
                @blur="formData.keyword = $event.target.value.trim()"
              ></span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 0; display: none">
          <el-input></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="article-list">
      <DataList
        :loading="loading"
        :dataSource="articleInfoList"
        @loadDate="search"
        noDataMsg="没有找到文章"
      >
        <template #default="{ data }">
          <ArticleItem :data="data" :htmlTitle="true"></ArticleItem>
        </template>
      </DataList>
    </div>
  </div>
</template>

<style lang="scss">
.search-body {
  background: #fff;
  padding: 10px;
  min-height: calc(100vh - 220px);
  .search-panel {
    display: flex;
    justify-content: center;
    .el-input {
      width: 700px;
    }
  }
}
</style>
