<script setup>
import { getCurrentInstance, ref, watch } from 'vue'
import { userLoginAndRegisterService } from '@/api/register'
import ArticleItem from '@/views/components/ArticleItem.vue'
import { useRoute } from 'vue-router'
import { useBoardStore } from '@/stores'
const boardStore = useBoardStore()
const route = useRoute()
const { proxy } = getCurrentInstance()
const api = {
  loadArticle: '/forum/loadArticle'
}
//获取文章列表
//一级版块
const pBoardId = ref(0)
//二级版块
const boardId = ref(0)
const orderType = ref(0)
const loading = ref(false)
const articleInfoList = ref({})
const getloadArticle = async (page) => {
  loading.value = true
  let params = {
    pageNo: page,
    pBoardId: pBoardId.value,
    boardId: boardId.value,
    orderType: orderType.value
  }
  const {
    data: { data }
  } = await userLoginAndRegisterService(api.loadArticle, params)
  articleInfoList.value = data
  loading.value = false
}
//tab切换
const changeOrderType = (type) => {
  orderType.value = type
  getloadArticle()
}

//二级版块
const subBoardList = ref([])
const setSubBoard = () => {
  subBoardList.value = boardStore.getSubBoardList(pBoardId.value)
}

//监听路由变化
watch(
  () => route.params,
  (newVal) => {
    pBoardId.value = newVal.pBoardId
    boardId.value = newVal.boardId || 0
    setSubBoard()
    getloadArticle()
    boardStore.setActivepBoardId(newVal.pBoardId)
    boardStore.setActiveBoardId(newVal.boardId)
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div
    class="page-container article-list-body"
    :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
  >
    <!-- 二级版块信息 -->
    <div class="sub-board" v-if="pBoardId">
      <span :class="['board-item', boardId == 0 ? 'active' : '']"
        ><router-link :to="`/forum/${pBoardId}`">全部</router-link></span
      >
      <span
        v-for="item in subBoardList"
        :key="item.boardId"
        :class="['board-item', item.boardId == boardId ? 'active' : '']"
        ><router-link :to="`/forum/${item.pBoardId}/${item.boardId}`">{{
          item.boardName
        }}</router-link></span
      >
    </div>
    <div class="article-panel">
      <div class="top-tab">
        <div
          :class="['tab', orderType == 0 ? 'active' : '']"
          @click="changeOrderType(0)"
        >
          热榜
        </div>
        <el-divider direction="vertical"></el-divider>
        <div
          :class="['tab', orderType == 1 ? 'active' : '']"
          @click="changeOrderType(1)"
        >
          发布时间
        </div>
        <el-divider direction="vertical"></el-divider>
        <div
          :class="['tab', orderType == 2 ? 'active' : '']"
          @click="changeOrderType(2)"
        >
          最新
        </div>
      </div>
      <div class="article-list">
        <DataList
          :loading="loading"
          :dataSource="articleInfoList"
          @loadDate="getloadArticle"
          noDataMsg="没有发现文章，赶紧来成为第一个吧！"
        >
          <template #default="{ data }">
            <ArticleItem :data="data"></ArticleItem>
          </template>
        </DataList>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.article-list-body {
  .sub-board {
    padding: 10px 0px 15px 0px;
    .board-item {
      background: #fff;
      border-radius: 15px;
      padding: 2px 10px;
      margin-right: 10px;
      color: #686666;
      cursor: pointer;
      font-size: 14px;
      a {
        text-decoration: none;
        color: #686666;
      }
    }
    .active {
      background: var(--link);
      a {
        color: #fff;
      }
    }
  }
  .article-panel {
    background: #fff;
    .top-tab {
      display: flex;
      align-items: center;
      padding: 10px;
      font-size: 15px;
      border-radius: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
      .tab {
        cursor: pointer;
      }
      .active {
        color: var(--link);
      }
    }
  }
}
</style>
