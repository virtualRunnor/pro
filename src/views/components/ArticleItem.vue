<script setup>
import { useSysStore } from '@/stores'
import { useRouter } from 'vue-router'
const router = useRouter()
const sysStore = useSysStore()
const editArticle = (articleId) => {
  router.push(`/editPost/${articleId}`)
}
const props = defineProps({
  data: {
    type: Object
  },
  showEdit: {
    type: Boolean,
    default: false
  },
  htmlTitle: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="article-item">
    <div class="article-item-inner">
      <div class="article-body">
        <div class="user-info">
          <AvatarCom
            :addLink="true"
            :userId="data.userId"
            :size="30"
          ></AvatarCom>
          <router-link :to="`/user/${props.data.userId}`" class="link-info">{{
            data.nickName
          }}</router-link>
          <el-divider direction="vertical"></el-divider>
          <div class="post-time">{{ data.postTime }}</div>
          <div class="address">&nbsp;·&nbsp;{{ data.userIpAddress }}</div>
          <el-divider direction="vertical"></el-divider>
          <router-link :to="`/forum/${data.pBoardId}`" class="link-info">{{
            data.pBoardName
          }}</router-link>
          <template v-if="data.boardId">
            <span>&nbsp;&nbsp;/&nbsp;&nbsp;</span>
            <router-link
              :to="`/forum/${data.pBoardId}/${data.boardId}`"
              class="link-info"
              >{{ data.boardName }}</router-link
            >
          </template>
        </div>
        <router-link :to="`/post/${data.articleId}`" class="title">
          <span class="top" v-if="data.topType == 1">置顶</span>
          <span v-if="data.status == 0" class="tag tag-no-audit">待审核</span>
          <span class="sub-title" v-if="htmlTitle" v-html="data.title"></span>
          <span class="sub-title" v-else>{{ data.title }}</span>
        </router-link>
        <div class="summary">{{ data.summary }}</div>
        <div class="article-info">
          <span class="iconfont icon-eye-solid">
            {{ data.readCount == 0 ? '阅读' : data.readCount }}
          </span>
          <span class="iconfont icon-good">
            {{ data.goodCount == 0 ? '点赞' : data.goodCount }}
          </span>
          <span
            class="iconfont icon-comment"
            v-if="sysStore.sysSeting.commentOpen == true"
          >
            {{ data.commentCount == 0 ? '评论' : data.commentCount }}
          </span>
          <span
            class="iconfont icon-edit edit-btn"
            v-if="showEdit"
            @click="editArticle(data.articleId)"
            >编辑</span
          >
        </div>
      </div>
      <RouterLink :to="`/post/${data.articleId}`"
        ><CoverCom :cover="data.cover" :width="100" v-if="data.cover"></CoverCom
      ></RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.article-item {
  padding: 10px 20px;
  .article-item-inner {
    border-bottom: 1px solid #ddd;
    padding: 10px 0px;
    display: flex;
    .article-body {
      flex: 1;
      .user-info {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #4e5969;
        .link-info {
          margin-left: 5px;
          color: #4e5969;
          text-decoration: none;
        }
        .link-info:hover {
          color: var(--link);
        }
        .post-time {
          font-size: 14px;
        }
      }
      .title {
        text-decoration: none;
        color: #4a4a4a;
        font-size: 16px;
        margin: 10px 0px;
        display: inline-block;
        .top {
          font-size: 12px;
          border-radius: 5px;
          border: 2px solid var(--pink);
          color: var(--pink);
          padding: 0px 5px;
          margin-right: 10px;
        }
        .sub-title {
          font-weight: 700;
          .sub-sub-item {
            font-weight: 800;
            color: red;
            background: #ddd;
          }
        }
      }
    }
    .summary {
      font-size: 14px;
      color: #86909c;
    }
    .article-info {
      margin-top: 10px;
      display: flex;
      align-items: center;
      font-size: 13px;
      .iconfont {
        color: #86909c;
        margin-right: 25px;
        font-size: 14px;
      }
      .iconfont:before {
        padding-right: 3px;
      }
      .edit-btn {
        color: var(--link);
        cursor: pointer;
      }
    }
  }
}
.article-item:hover {
  background: #ddd;
}
</style>
