<script setup>
import { useUserStore } from '@/stores'
import { inject, nextTick, ref, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { userLoginAndRegisterService } from '@/api/register'
import CommentImage from '@/views/forum/CommentImage.vue'
const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const router = useRouter()
const api = {
  commentdoLike: '/comment/doLike',
  changeTopType: '/comment/changeTopType'
}
//显示评论框
const placeholder = ref(null)
const pCommentId = ref(0)
const replyUserId = ref(null)
const emit = defineEmits([
  'hiddenAllReply',
  'secondPostCommentFinish',
  'showSubReplyPanel',
  'reloadData'
])
const showLoginPanel = inject('useShowPanel')
const showReplyPanel = (currentData) => {
  if (!Object.keys(userStore.loginUserInfo).length > 0) {
    showLoginPanel(1)
    return
  }
  const haveShow =
    props.commentData.showReply == undefined
      ? false
      : props.commentData.showReply
  const obj = {
    haveShow: haveShow,
    curData: currentData
  }
  emit('hiddenAllReply', currentData)
  emit('showSubReplyPanel', obj)
  pCommentId.value = props.commentData.commentId
  replyUserId.value = currentData.userId
  placeholder.value = '回复 @' + currentData.nickName
  nextTick(() => {
    goToReplyPosition('view-reply-id')
  })
}

const postCommentFinishHandler = (data) => {
  let obj = {
    data: data,
    commentId: props.commentData.commentId
  }
  emit('secondPostCommentFinish', obj)
}

const gotoUcenter = (userId) => {
  router.push(`/user/${userId}`)
}

//点赞
const dolike = async (data) => {
  if (!Object.keys(userStore.loginUserInfo).length > 0) {
    showLoginPanel(1)
    return
  }
  const res = await userLoginAndRegisterService(api.commentdoLike, {
    commentId: data.commentId
  })
  console.log(res)
  data.goodCount = res.data.data.goodCount
  data.likeType = res.data.data.likeType
}

//回复跳转
const goToReplyPosition = (domId) => {
  console.log(domId)
  document
    .querySelector('#' + domId)
    .scrollIntoView({ behavior: 'smooth', block: 'center' })
}

//置顶
const opTop = async (data) => {
  const res = await userLoginAndRegisterService(api.changeTopType, {
    commentId: data.commentId,
    topType: data.topType == 1 ? 0 : 1
  })
  console.log(res)
  emit('reloadData')
}

const props = defineProps({
  commentData: {
    type: Object
  },
  articleUserId: {
    type: String
  },
  articleId: {
    type: String
  }
})
</script>

<template>
  <div class="comment-item">
    <AvatarCom :userId="commentData.userId"></AvatarCom>
    <div class="comment-info">
      <div class="nick-name">
        <span class="name" @click="gotoUcenter(commentData.userId)">{{
          commentData.nickName
        }}</span>
        <span v-if="commentData.userId == articleUserId" class="tag-author"
          >作者</span
        >
      </div>
      <div class="comment-content">
        <div>
          <span class="tag tag-topping" v-if="commentData.topType == 1"
            >置顶</span
          >
          <span class="tag no-audit" v-if="commentData.status == 0"
            >待审核</span
          >
          <span v-html="commentData.content"></span>
        </div>
        <CommentImage
          v-if="commentData.imgPath"
          :style="{ 'margin-top': '10px' }"
          :src="
            proxy.globalInfo.imageUrl + commentData.imgPath.replace('.', '_.')
          "
          :imageList="[proxy.globalInfo.imageUrl + commentData.imgPath]"
        ></CommentImage>
      </div>
      <div class="op-panel">
        <div class="time">
          <span>{{ commentData.postTime }}</span>
          <span class="address"
            >&nbsp;·&nbsp;{{ commentData.userIpAddress }}</span
          >
        </div>
        <div
          :class="[
            'iconfont icon-good',
            commentData.likeType == 1 ? 'active' : ''
          ]"
          @click="dolike(commentData)"
        >
          {{ commentData.goodCount > 0 ? commentData.goodCount : '点赞' }}
        </div>
        <div class="iconfont icon-comment" @click="showReplyPanel(commentData)">
          回复
        </div>
        <el-dropdown v-if="articleUserId == userStore.loginUserInfo.userId">
          <div class="iconfont icon-more"></div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="opTop(commentData)">{{
                commentData.topType == 0 ? '设为置顶' : '取消置顶'
              }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="comment-sub-list" v-if="commentData.children">
        <div
          class="comment-sub-item"
          v-for="sub in commentData.children"
          :key="sub.commentId"
        >
          <AvatarCom :userId="sub.userId" :size="30"></AvatarCom>
          <div class="comment-sub-info">
            <div class="nick-name">
              <span class="name" @click="gotoUcenter(sub.userId)">{{
                sub.nickName
              }}</span>
              <span v-if="sub.userId == articleUserId" class="tag-author"
                >作者</span
              >
              <span class="reply-name">回复</span>
              <span
                @click="gotoUcenter(sub.replyUserId)"
                class="reply-user-link"
                >@{{ sub.replyNickName }}</span
              >
              <span>：</span>
              <span class="sub-content" v-html="sub.content"></span>
            </div>
            <div class="op-panel">
              <div class="time">
                <span>{{ sub.postTime }}</span>
                <span class="address"
                  >&nbsp;·&nbsp;{{ sub.userIpAddress }}</span
                >
              </div>
              <div
                @click="dolike(sub)"
                :class="[
                  'iconfont icon-good',
                  sub.likeType == 1 ? 'active' : ''
                ]"
              >
                {{ sub.goodCount > 0 ? sub.goodCount : '点赞' }}
              </div>
              <div class="iconfont icon-comment" @click="showReplyPanel(sub)">
                回复
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="reply-info" id="view-reply-id" v-if="commentData.showReply">
        <PostComment
          :articleId="articleId"
          :showInsertImg="false"
          :placeholder="placeholder"
          :pCommentId="pCommentId"
          :replyUserId="replyUserId"
          @postCommentFinish="postCommentFinishHandler"
        ></PostComment>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.comment-item {
  display: flex;
  padding-top: 15px;
  .comment-info {
    flex: 1;
    padding-left: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #ddd;
    .nick-name {
      .name {
        font-size: 4px;
        color: var(--text2);
        margin-right: 10px;
        cursor: pointer;
      }
      .tag-author {
        background: var(--pink);
        color: #fff;
        font-size: 12px;
        padding: 0px 3px;
        border-radius: 2px;
      }
    }
    .comment-content {
      margin-top: 5px;
      font-size: 15px;
      .tag {
        margin-right: 5px;
        font-size: 12px;
        border-radius: 3px;
        padding: 0px 5px;
      }
      .tag-topping {
        color: var(--pink);
        border: 1px solid var(--pink);
      }
      .no-audit {
        color: var(--text2);
        border: 1px solid var(--text2);
      }
    }
    .op-panel {
      display: flex;
      margin-top: 5px;
      font-size: 13px;
      color: var(--icon);
      align-items: center;
      .time {
        margin-right: 20px;
      }
      .iconfont {
        margin-right: 15px;
        font-size: 14px;
        cursor: pointer;
      }
      .iconfont::before {
        margin-right: 5px;
      }
      .active {
        color: var(--link);
      }
    }
    .comment-sub-list {
      margin-top: 10px;
      .comment-sub-item {
        display: flex;
        margin: 8px 0px;
        font-size: 14px;
        .comment-sub-info {
          margin-left: 5px;
          .nick-name {
            .reply-name {
              margin: 0px 5px;
            }
            .sub-content {
              font-size: 15px;
            }
            .reply-user-link {
              color: var(--link);
              cursor: pointer;
            }
          }
        }
      }
    }
    .reply-info {
      margin-top: 15px;
    }
  }
}
</style>
