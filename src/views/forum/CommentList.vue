<script setup>
import { ref } from 'vue'
import { userLoginAndRegisterService } from '@/api/register'
import CommentListItem from '@/views/forum/CommentListItem.vue'
const api = {
  loadComment: '/comment/loadComment'
}

//评论列表
const loading = ref(null)
const orderType = ref(0)
const commentListInfo = ref({})
const loadComment = async () => {
  const params = {
    pageNo: commentListInfo.value.pageNo,
    articleId: props.articleId,
    orderType: orderType.value
  }
  const {
    data: { data }
  } = await userLoginAndRegisterService(api.loadComment, params)
  commentListInfo.value = data
}
loadComment()

//隐藏所有回复框
const hiddenAllReplyHandler = () => {
  commentListInfo.value.list.forEach((element) => {
    element.showReply = false
  })
}

const showSubReplyPanelHandler = (obj) => {
  if (obj.curData.pCommentId == 0) {
    const foundItem = commentListInfo.value.list.find(
      (item) => item.commentId == obj.curData.commentId
    )
    foundItem.showReply = !obj.haveShow
    return
  }

  const foundItemSub = commentListInfo.value.list.find(
    (item) => item.commentId == obj.curData.pCommentId
  )
  foundItemSub.showReply = true
}

//评论发布完成
const emit = defineEmits(['updateCommentCount'])
const postCommentFinishHandler = (data) => {
  commentListInfo.value.list.unshift(data)
  //更新数量
  const totalCount = commentListInfo.value.totalCount + 1
  commentListInfo.value.totalCount = totalCount
  emit('updateCommentCount', totalCount)
}

//排序
const orderTypeChange = (type) => {
  orderType.value = type
  loadComment()
}

const secondPostHandler = (obj) => {
  const foundItem = commentListInfo.value.list.find(
    (item) => item.commentId === obj.commentId
  )

  if (foundItem) {
    foundItem.children = obj.data
  }
}

const props = defineProps({
  articleId: {
    type: String
  },
  articleUserId: {
    type: String
  }
})
</script>

<template>
  <div class="comment-body">
    <div class="comment-title">
      <div class="title">
        评论<span class="count">{{ commentListInfo.totalCount }}</span>
      </div>
      <div class="tab">
        <span
          @click="orderTypeChange(0)"
          :class="['tab-item', orderType == 0 ? 'active' : '']"
          >热榜</span
        >
        <el-divider direction="vertical" />
        <span
          @click="orderTypeChange(1)"
          :class="['tab-item', orderType == 1 ? 'active' : '']"
          >最新</span
        >
      </div>
    </div>
    <!-- 发送评论 -->
    <div class="comment-form-panel">
      <PostComment
        :pCommentId="0"
        :articleId="articleId"
        :showInsertImg="true"
        placeholder="请文明发育，做一个邦邦的程序员"
        @postCommentFinish="postCommentFinishHandler"
      ></PostComment>
    </div>
    <!-- 用户评论 -->
    <div class="comment-list">
      <DataList
        :dataSource="commentListInfo"
        :loading="loading"
        @loadDate="loadComment"
        noDataMsg="暂无评论，赶紧占坑吧"
      >
        <template #default="{ data }">
          <CommentListItem
            @hiddenAllReply="hiddenAllReplyHandler"
            @secondPostCommentFinish="secondPostHandler"
            @showSubReplyPanel="showSubReplyPanelHandler"
            @reloadData="loadComment"
            :commentData="data"
            :articleUserId="articleUserId"
            :articleId="articleId"
          ></CommentListItem>
        </template>
      </DataList>
    </div>
  </div>
</template>

<style lang="scss">
.comment-body {
  .comment-title {
    display: flex;
    align-items: center;
    .title {
      font-size: 20px;
      .count {
        font-size: 14px;
        padding: 0px 10px;
      }
    }
    .tab {
      .active {
        color: var(--link);
      }
      .tab-item {
        cursor: pointer;
      }
    }
  }
  .comment-form-panel {
    margin-top: 20px;
  }
}
</style>
