<script setup>
import {
  getCurrentInstance,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  ref
} from 'vue'
import { userLoginAndRegisterService } from '@/api/register'
import { useRoute } from 'vue-router'
import useSizeToStr from '@/utils/sizeToStr'
import { useUserStore, useSysStore } from '@/stores'
import { ElMessage, ElMessageBox } from 'element-plus'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'
import { useBoardStore } from '@/stores'
import CommentList from '@/views/forum/CommentList.vue'
const sysStore = useSysStore()
const boardStore = useBoardStore()
const route = useRoute()
const userStore = useUserStore()
const { proxy } = getCurrentInstance()
const api = {
  getDetail: '/forum/getArticleDetail',
  doLike: '/forum/doLike',
  getDownloadInfo: '/forum/getUserDownloadInfo',
  attachDownload: '/api/forum/attachmentDownload'
}

//文章详情
const articleInfo = ref({})
//附件
const attactment = ref({})
//是否已经点赞
const haveLike = ref(false)
const getArticleDetail = async (articleId) => {
  const {
    data: { data }
  } = await userLoginAndRegisterService(api.getDetail, { articleId })
  if (!data) {
    return
  }
  articleInfo.value = data.forumArticle
  attactment.value = data.attachment
  haveLike.value = data.haveLike

  boardStore.setActivepBoardId(data.forumArticle.pBoardId)
  boardStore.setActiveBoardId(data.forumArticle.boardId)

  //图片预览
  imagePreview()

  //代码高亮
  highLightCode()

  //生成目录
  makeToc()
}
onMounted(() => {
  getArticleDetail(route.params.articleId)
})
const quickPanelLeft = ref(
  (window.innerWidth - proxy.globalInfo.bodyWidth) / 2 - 120
)

//监听页面大小
const listenResize = () => {
  quickPanelLeft.value =
    (window.innerWidth - proxy.globalInfo.bodyWidth) / 2 - 120
}

//mounted中增加 页面大小改变监听，Unmounted中取消监听
onMounted(() => {
  window.addEventListener('resize', listenResize, false)
})

onUnmounted(() => {
  window.removeEventListener('resize', listenResize, false)
})
//快捷操作
const goToPosition = (domId) => {
  console.log(domId)
  document.querySelector('#' + domId).scrollIntoView()
}

//点赞
const showLoginPanel = inject('useShowPanel')
const doLikeHandler = async () => {
  if (!Object.keys(userStore.loginUserInfo).length > 0) {
    showLoginPanel(1)
    return
  }
  await userLoginAndRegisterService(api.doLike, {
    articleId: articleInfo.value.articleId
  })
  haveLike.value = !haveLike.value
  let goodCount = 1
  if (!haveLike.value) {
    goodCount = -1
  }
  articleInfo.value.goodCount = articleInfo.value.goodCount + goodCount
}

// 下载附件
const downloadAttachment = async (fileId) => {
  if (!Object.keys(userStore.loginUserInfo).length > 0) {
    showLoginPanel(1)
    return
  }

  //0积分
  if (
    attactment.value.integral == 0 ||
    userStore.loginUserInfo.userId == articleInfo.value.userId
  ) {
    downloadDo(fileId)
    return
  }

  //获取用户积分
  const {
    data: { data }
  } = await userLoginAndRegisterService(api.getDownloadInfo, { fileId })

  //判断用户是否下载过
  if (data.userIntegral.haveDownload) {
    downloadDo(fileId)
    return
  }

  //判断积分
  if (data.userIntegral < attactment.value.integral) {
    ElMessage.error('积分不足，无法下载')
    return
  }
  const message = `
        你还有 <span style="color: red;">${data.userIntegral}</span> 积分，
        当前下载会扣除 <span style="color: red;">${attactment.value.integral}</span> 积分，
        确定要下载吗？`
  await ElMessageBox.confirm(message, '附件下载', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    dangerouslyUseHTMLString: true
  })

  downloadDo(fileId)
}
const downloadDo = (fileId) => {
  document.location.href = api.attachDownload + '?fileId=' + fileId
  attactment.value.downloadCount++
}

//文章图片预览
const imageViewerRef = ref()
const previewImageList = ref([])
const imagePreview = () => {
  nextTick(() => {
    const imageNodeList = document
      .querySelector('#detail')
      .querySelectorAll('img')
    const imageList = []
    imageNodeList.forEach((item, index) => {
      const src = item.getAttribute('src')
      imageList.push(src)
      item.addEventListener('click', () => {
        imageViewerRef.value.showImagePreview(index)
      })
    })
    previewImageList.value = imageList
  })
}

//代码高亮
const highLightCode = () => {
  nextTick(() => {
    let blocks = document.querySelectorAll('pre code')
    blocks.forEach((item) => {
      hljs.highlightBlock(item)
    })
  })
}

//更新评论数量
const updateCommentCountHandler = (commentCount) => {
  articleInfo.value.commentCount = commentCount
}

//获取目录
const tocArray = ref([])
const makeToc = () => {
  nextTick(() => {
    const tocTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']
    //获取所有H标签
    const contentDom = document.querySelector('#detail')
    const childNodes = contentDom.childNodes
    let index = 0
    childNodes.forEach((item) => {
      let tagName = item.tagName
      if (tagName == undefined || !tocTags.includes(tagName.toUpperCase())) {
        return true
      }
      index++
      let id = 'toc' + index
      item.setAttribute('id', id)
      tocArray.value.push({
        id: id,
        title: item.innerText,
        level: Number.parseInt(tagName.substring(1)),
        offsetTop: item.offsetTop
      })
    })
  })
}

const anchorId = ref(null)
const ghotoAnchor = (domId) => {
  const dom = document.querySelector('#' + domId)
  dom.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

//获取滚动条的高度
const getScrollTop = () => {
  let scrollTop =
    document.documentElement.scrollTop ||
    window.pageYOffset ||
    document.body.scrollTop
  return scrollTop
}

const listenerScroll = () => {
  let currentScrollTop = getScrollTop()
  tocArray.value.some((item, index) => {
    if (
      (index < tocArray.value.length - 1 &&
        currentScrollTop >= tocArray.value[index].offsetTop &&
        currentScrollTop < tocArray.value[index + 1].offsetTop) ||
      (index == tocArray.value.length - 1 &&
        currentScrollTop > tocArray.value[index].offsetTop)
    ) {
      anchorId.value = item.id
      return true
    }
  })
}

onMounted(() => {
  window.addEventListener('scroll', listenerScroll, false)
})

onUnmounted(() => {
  window.removeEventListener('scroll', listenerScroll, false)
})
</script>

<template>
  <div
    class="page-container article-Detail-body"
    :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
    v-if="Object.keys(articleInfo).length > 0"
  >
    <!-- 版块导航 -->
    <div class="board-info">
      <RouterLink :to="`/forum/${articleInfo.pBoardId}`" class="a-link">{{
        articleInfo.pBoardName
      }}</RouterLink>
      <span class="iconfont icon-right"></span>
      <template v-if="articleInfo.boardId">
        <RouterLink
          :to="`/forum/${articleInfo.pBoardId}/${articleInfo.boardId}`"
          class="a-link"
          >{{ articleInfo.boardName }}
        </RouterLink>
        <span class="iconfont icon-right"></span>
      </template>
      <span>{{ articleInfo.title }}</span>
    </div>
    <!-- 文章详情 -->
    <div
      class="detail-container"
      :style="{ width: proxy.globalInfo.bodyWidth - 300 + 'px' }"
    >
      <div class="article-detail">
        <!-- 标题 -->
        <div class="title">
          <span
            class="tag tag-no-audit"
            v-if="articleInfo.status == 0"
            type="danger"
            >待审核</span
          >
          {{ articleInfo.title }}
        </div>
        <!-- 作者信息 -->
        <div class="user-info">
          <AvatarCom :userId="articleInfo.userId" :size="50"></AvatarCom>
          <div class="user-info-detail">
            <router-link
              :to="`/user/${articleInfo.userId}`"
              class="nick-name"
              >{{ articleInfo.nickName }}</router-link
            >
            <div class="time-info">
              <span>{{ articleInfo.postTime }}</span>
              <span class="address"
                >&nbsp;·&nbsp;{{ articleInfo.userIpAddress }}</span
              >
              <span class="iconfont icon-eye-solid">
                {{
                  articleInfo.readCount == 0 ? '阅读' : articleInfo.readCount
                }}
              </span>
              <router-link
                v-if="articleInfo.userId == userStore.loginUserInfo.userId"
                class="a-link btn-edit"
                :to="`/editPost/${articleInfo.articleId}`"
              >
                <span class="iconfont icon-edit">编辑</span>
              </router-link>
            </div>
          </div>
        </div>
        <!-- 文章详情 -->
        <div class="detail" id="detail" v-html="articleInfo.content"></div>
      </div>
      <!-- 附件 -->
      <div class="attachment-panel" v-if="attactment" id="view-attachment-id">
        <div class="attachment-title">附件</div>
        <div class="attachment-info">
          <div class="iconfont icon-zip"></div>
          <div class="file-name attachment-item">{{ attactment.fileName }}</div>
          <div class="size attachment-item">
            {{ useSizeToStr.sizeToStr(attactment.fileSize) }}
          </div>
          <div class="attachment-item">
            需要<span class="integral">{{ attactment.integral }}</span
            >积分
          </div>
          <div class="download-count attachment-item">
            已下载{{ attactment.downloadCount }}
          </div>
          <div class="download-btn attachment-item">
            <el-button
              type="primary"
              size="small"
              @click="downloadAttachment(attactment.fileId)"
              >下载</el-button
            >
          </div>
        </div>
      </div>
      <!-- 评论 -->
      <div
        class="comment-panel"
        id="view-comment-id"
        v-if="sysStore.sysSeting.commentOpen == true && articleInfo.status == 1"
      >
        <CommentList
          v-if="articleInfo.articleId"
          :articleId="articleInfo.articleId"
          :articleUserId="articleInfo.userId"
          @updateCommentCount="updateCommentCountHandler"
        ></CommentList>
      </div>
    </div>
    <!-- 目录 -->
    <div class="toc-panel">
      <div class="top-container">
        <div class="toc-title">目录</div>
        <div class="toc-list">
          <template v-if="tocArray.length == 0">
            <div class="no-toc">未解析到目录</div>
          </template>
          <template v-else>
            <div v-for="toc in tocArray" :key="toc.id">
              <span
                :style="{ 'padding-left': toc.level * 15 + 'px' }"
                @click="ghotoAnchor(toc.id)"
                :class="['toc-item', toc.id == anchorId ? 'active' : '']"
                >{{ toc.title }}</span
              >
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
  <!-- 左侧快捷操作 -->
  <div
    class="quick-panel"
    :style="{ left: quickPanelLeft + 'px' }"
    v-if="quickPanelLeft"
  >
    <!-- 点赞 -->
    <el-badge
      :value="articleInfo.goodCount"
      type="info"
      :hidden="!articleInfo.goodCount > 0"
    >
      <div class="quick-item" @click="doLikeHandler">
        <span
          :class="['iconfont icon-good', haveLike ? 'have-like' : '']"
        ></span>
      </div>
    </el-badge>
    <!-- 评论跳转 -->
    <el-badge
      v-if="sysStore.sysSeting.commentOpen == true"
      :value="articleInfo.commentCount"
      type="info"
      :hidden="!articleInfo.commentCount > 0"
    >
      <div
        class="quick-item"
        @click="goToPosition('view-comment-id')"
        v-if="sysStore.sysSeting.commentOpen == true"
      >
        <span class="iconfont icon-comment"></span>
      </div>
    </el-badge>
    <!-- 链接 -->
    <div class="quick-item" @click="goToPosition('view-attachment-id')">
      <span class="iconfont icon-attachment"></span>
    </div>
    <!-- 图片预览 -->
    <ImageViewer
      ref="imageViewerRef"
      :imageList="previewImageList"
    ></ImageViewer>
  </div>
</template>

<style lang="scss">
.article-Detail-body {
  position: relative;
  // margin-top: 60px;
  .board-info {
    line-height: 40px;
    padding-left: 5px;
    .icon-right {
      margin: 0px 10px;
    }
  }
  .detail-container {
    .article-detail {
      padding: 15px;
      background: #fff;
      .title {
        font-size: 16px;
        font-weight: bold;
      }
      .user-info {
        margin-top: 15px;
        display: flex;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
        .user-info-detail {
          margin-left: 10px;
          .nick-name {
            text-decoration: none;
            color: #4e5969;
            font-size: 15px;
          }
          .nick-name:hover {
            color: var(--link);
          }
          .time-info {
            margin-top: 5px;
            font-size: 13px;
            color: var(--text2);
            .btn-edit {
              .iconfont {
                font-size: 14px;
              }
            }
            .iconfont {
              margin-left: 10px;
            }
            .iconfont::before {
              padding-right: 3px;
            }
          }
        }
      }
      .detail {
        letter-spacing: 1px;
        line-height: 30px;
        a {
          text-decoration: none;
          color: var(--link);
        }
        img {
          max-width: 90%;
          cursor: pointer;
        }
      }
    }
    .attachment-panel {
      margin-top: 20px;
      background: #fff;
      padding: 20px;
      .attachment-title {
        font-size: 18px;
      }
      .attachment-info {
        display: flex;
        color: #9f9f9f;
        align-items: center;
        margin-top: 10px;
        .attachment-item {
          margin-left: 10px;
        }
        .icon-zip {
          font-size: 20px;
          color: #6ca1f7;
        }
        .file-name {
          color: #6ca1f7;
        }
        .integral {
          color: red;
          padding: 0px 5px;
        }
      }
    }
    .comment-panel {
      margin-top: 20px;
      background: #fff;
      padding: 20px;
    }
  }
}
.quick-panel {
  position: fixed;
  width: 50px;
  top: 200px;
  text-align: center;
  .el-badge__content.is-fixed {
    top: 5px;
    right: 15px;
  }
  .quick-item {
    display: flex;
    width: 50px;
    height: 50px;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: #fff;
    margin-bottom: 30px;
    cursor: pointer;
  }
  .iconfont {
    font-size: 22px;
    color: var(--text2);
  }
  .have-like {
    color: red;
  }
}

.toc-panel {
  position: absolute;
  top: 40px;
  right: 0px;
  width: 285px;
  .top-container {
    width: 285px;
    position: fixed;
    background: #fff;
    .toc-title {
      border-bottom: 1px solid #ddd;
      padding: 10px;
    }
    .toc-list {
      max-height: calc(100vh - 200px);
      overflow: auto;
      padding: 5px;
      .no-toc {
        text-align: center;
        color: #6e6c6c;
        line-height: 40px;
        font-size: 13px;
      }
      .toc-item {
        cursor: pointer;
        display: block;
        line-height: 35px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: #555666;
        border-radius: 3px;
        font-size: 14px;
        border-left: 2px solid #fff;
      }
      .toc-item:hover {
        background: #eeeded;
      }
      .active {
        border-left: 2px solid #6ca1f7;
        border-radius: 0px 3px 3px 0px;
      }
    }
  }
}
</style>
