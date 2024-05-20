<script setup>
import { ref, getCurrentInstance, watch, onMounted } from 'vue'
import { useUserStore, useBoardStore } from '@/stores'
import { userLoginAndRegisterService } from '@/api/register'
import { useRouter, useRoute } from 'vue-router'
const boardStore = useBoardStore()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { proxy } = getCurrentInstance()
const activeTabName = ref('reply')
const loadTabName = () => {
  activeTabName.value = route.params.type
}
const api = {
  loadMessageList: '/ucenter/loadMessageList'
}
const tabChange = (type) => {
  router.push(`/user/message/${type}`)
}
const loading = ref(false)
const messageListInfo = ref({})
const loadMessage = async (page) => {
  loading.value = true
  let params = {
    pageNo: page,
    code: activeTabName.value
  }
  const {
    data: { data }
  } = await userLoginAndRegisterService(api.loadMessageList, params)
  messageListInfo.value = data
  userStore.readMessage(activeTabName.value)
  loading.value = false
}
watch(
  () => route,
  (newVal) => {
    if (newVal.path.indexOf('/user/message') != -1) {
      console.log('发生了监听')
      loadTabName()
      loadMessage()
    }
  },
  { immediate: true, deep: true }
)
onMounted(() => {
  boardStore.setActivepBoardId(-1)
})
</script>

<template>
  <div
    class="page-container message-center"
    :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
  >
    <div class="user-banner">
      <router-link to="/" class="a-link">首页</router-link>
      <span class="iconfont icon-right"></span>
      <span>消息中心</span>
    </div>
    <div class="message-panel">
      <div class="tab-list">
        <el-tabs v-model="activeTabName" @tab-change="tabChange">
          <el-tab-pane name="reply">
            <template #label>
              <div class="tab-item">
                <span>回复我的</span>
                <span
                  class="count-tag"
                  v-if="userStore.messageCountInfo.reply > 0"
                  >{{
                    userStore.messageCountInfo.reply > 99
                      ? '99+'
                      : userStore.messageCountInfo.reply
                  }}</span
                >
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="likePost">
            <template #label>
              <div class="tab-item">
                <span>赞了我的文章</span>
                <span
                  class="count-tag"
                  v-if="userStore.messageCountInfo.likePost > 0"
                  >{{
                    userStore.messageCountInfo.likePost > 99
                      ? '99+'
                      : userStore.messageCountInfo.likePost
                  }}</span
                >
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="downloadAttachment">
            <template #label>
              <div class="tab-item">
                <span>下载了我的附件</span>
                <span
                  class="count-tag"
                  v-if="userStore.messageCountInfo.downloadAttachment > 0"
                  >{{
                    userStore.messageCountInfo.downloadAttachment > 99
                      ? '99+'
                      : userStore.messageCountInfo.downloadAttachment
                  }}</span
                >
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="likeComment">
            <template #label>
              <div class="tab-item">
                <span>赞了我的评论</span>
                <span
                  class="count-tag"
                  v-if="userStore.messageCountInfo.likeComment > 0"
                  >{{
                    userStore.messageCountInfo.likeComment > 99
                      ? '99+'
                      : userStore.messageCountInfo.likeComment
                  }}</span
                >
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="sys">
            <template #label>
              <div class="tab-item">
                <span>系统消息</span>
                <span
                  class="count-tag"
                  v-if="userStore.messageCountInfo.sys > 0"
                  >{{
                    userStore.messageCountInfo.sys > 99
                      ? '99+'
                      : userStore.messageCountInfo.sys
                  }}</span
                >
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>
        <router-link
          :to="`/user/${userStore.loginUserInfo.userId}`"
          class="a-link go-ucenter"
          >&lt;&lt;个人中心</router-link
        >
      </div>

      <div class="message-list">
        <DataList
          :loading="loading"
          :dataSource="messageListInfo"
          @loadDate="loadMessage"
          noDataMsg="暂无消息"
        >
          <template #default="{ data }">
            <!-- 系统消息 -->
            <div class="message-item" v-if="data.messageType == 0">
              <div class="message-content">
                <span v-html="data.messageContent"></span>
                <span class="create-time">{{ data.createTime }}</span>
              </div>
            </div>
            <!-- 回复我的 -->
            <div class="message-item" v-if="data.messageType == 1">
              <AvatarCom :userId="data.sendUserId" :size="50"></AvatarCom>
              <div class="message-content">
                <div>
                  <router-link class="a-link" :to="`/user/${data.sendUserId}`"
                    >@{{ data.sendNickName }}</router-link
                  >
                  对我的文章【
                  <router-link class="a-link" :to="`/post/${data.articleId}`">{{
                    data.articleTitle
                  }}</router-link
                  >】发表了评论
                  <span class="create-time">{{ data.createTime }}</span>
                </div>
                <div class="reply-content" v-html="data.messageContent"></div>
              </div>
            </div>
            <!-- 赞了我的评论 -->
            <div class="message-item" v-if="data.messageType == 3">
              <AvatarCom :userId="data.sendUserId" :size="50"></AvatarCom>
              <div class="message-content">
                <div>
                  <router-link class="a-link" :to="`/user/${data.sendUserId}`"
                    >@{{ data.sendNickName }}</router-link
                  >
                  在文章【
                  <router-link class="a-link" :to="`/post/${data.articleId}`">{{
                    data.articleTitle
                  }}</router-link
                  >】中赞了我的评论
                  <span class="create-time">{{ data.createTime }}</span>
                </div>
                <div class="reply-content" v-html="data.messageContent"></div>
              </div>
            </div>
            <!-- 赞了我的文章 -->
            <div class="message-item" v-if="data.messageType == 2">
              <AvatarCom :userId="data.sendUserId" :size="50"></AvatarCom>
              <div class="message-content">
                <div>
                  <router-link class="a-link" :to="`/user/${data.sendUserId}`"
                    >@{{ data.sendNickName }}</router-link
                  >
                  赞了我的文章【
                  <router-link class="a-link" :to="`/post/${data.articleId}`">{{
                    data.articleTitle
                  }}</router-link
                  >】
                  <span class="create-time">{{ data.createTime }}</span>
                </div>
              </div>
            </div>
            <!-- 下载了我的附件 -->
            <div class="message-item" v-if="data.messageType == 4">
              <AvatarCom :userId="data.sendUserId" :size="50"></AvatarCom>
              <div class="message-content">
                <div>
                  <router-link class="a-link" :to="`/user/${data.sendUserId}`"
                    >@{{ data.sendNickName }}</router-link
                  >
                  在文章【
                  <router-link class="a-link" :to="`/post/${data.articleId}`">{{
                    data.articleTitle
                  }}</router-link
                  >】中下载了我的附件
                  <span class="create-time">{{ data.createTime }}</span>
                </div>
              </div>
            </div>
          </template>
        </DataList>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.message-center {
  z-index: 1;
  .user-banner {
    color: #9ba7b9;
    line-height: 35px;
    .icon-right {
      padding: 0px 5px;
    }
  }
  .message-panel {
    background: #fff;
    padding: 10px;
    margin-top: 5px;
    .tab-list {
      position: relative;
      .tab-item {
        position: relative;
        padding: 0px 10px;
        .count-tag {
          top: -5px;
          right: -12px;
          position: absolute;
          margin-left: 10px;
          min-width: 20px;
          display: inline-block;
          background: #f56c6c;
          height: 18px;
          line-height: 15px;
          border-radius: 10px;
          font-size: 13px;
          text-align: center;
          color: #fff;
          padding-bottom: 10px;
        }
      }
      .go-ucenter {
        position: absolute;
        right: 10px;
        top: 5px;
        font-size: 14px;
      }
    }
    .message-list {
      .message-item {
        display: flex;
        justify-content: flex-start;
        font-size: 14px;
        border-bottom: 1px solid #ddd;
        align-items: center;
        padding: 10px;
        .message-content {
          margin-left: 5px;
          .create-time {
            color: #9ba7b9;
            margin-left: 10px;
          }
          .reply-content {
            border-left: 2px solid #11a8f4;
            padding-left: 5px;
            margin-top: 5px;
          }
        }
      }
    }
  }
}
</style>
