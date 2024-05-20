<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { getCurrentInstance, onMounted, ref, provide } from 'vue'
import LoginAndRegister from '@/views/components/LoginAndRegister.vue'
import AvatarCom from '@/components/AvatarCom.vue'
import { useUserStore, useBoardStore, useSysStore } from '@/stores'
import { userLoginAndRegisterService } from '@/api/register'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const boardStore = useBoardStore()
const sysStore = useSysStore()
const showHeader = ref(true)
const { proxy } = getCurrentInstance()
const loginRegisterRef = ref()
const api = {
  getUserInfo: '/getUserInfo',
  loadBoard: '/board/loadBoard',
  getMessageCount: '/ucenter/getMessageCount',
  getSysSetting: '/getSysSetting'
}
//设置LOGO字体样式
const logoInfo = ref([
  {
    id: 1,
    letter: 'Q',
    color: '#3285FF'
  },
  {
    id: 2,
    letter: 'm',
    color: '#FB3624'
  },
  {
    id: 3,
    letter: 'z',
    color: '#3285FF'
  },
  {
    id: 4,
    letter: 'b',
    color: '#25B24E'
  },
  {
    id: 5,
    letter: 'b',
    color: '#FD3224'
  },
  {
    id: 6,
    letter: 's',
    color: '#FFBA02'
  }
])

//获取滚动条的高度
const getScrollTop = () => {
  let scrollTop =
    document.documentElement.scrollTop ||
    window.pageYOffset ||
    document.body.scrollTop
  return scrollTop
}

const initScroll = () => {
  let initScrollTop = getScrollTop()
  let scrollType = 0
  window.addEventListener('scroll', () => {
    let currentScrollTop = getScrollTop()
    if (currentScrollTop > initScrollTop) {
      scrollType = 1
    } else {
      scrollType = 0
    }
    initScrollTop = currentScrollTop
    // console.log(scrollType === 0 ?'往上滚':'往下滚');
    if (scrollType === 1 && currentScrollTop > 100) {
      showHeader.value = false
    } else {
      showHeader.value = true
    }
  })
}
onMounted(() => {
  initScroll()
  getBoardList()
  getUserInfoPanel()
  loadSyeSetting()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', () => {})
})

// //Dialog
// const buttons = [
//   {text:'确定',type:'primary'}
// ]
// const showDia=ref(false)

//设置用户信息
const getUserInfoPanel = async () => {
  const {
    data: { data }
  } = await userLoginAndRegisterService(api.getUserInfo)
  if (!data) {
    return
  }
  userStore.setLoginUserInfo(data)
}

//获取版块信息
const boardList = ref([])
const getBoardList = async () => {
  const {
    data: { data }
  } = await userLoginAndRegisterService(api.loadBoard)
  boardList.value = data
  boardStore.updateBoardList(data)
}

//跨层级打开登录面板
provide('useShowPanel', (type) => {
  login(type)
})

//Login
const login = (type) => {
  loginRegisterRef.value.showPanel(type)
}

//版块点击
const boardClickHandler = (board) => {
  router.push(`/forum/${board.boardId}`)
}

//二级版块
const subBoardClickHandler = (suboard) => {
  router.push(`/forum/${suboard.pBoardId}/${suboard.boardId}`)
}

//发帖
const newPost = () => {
  if (!Object.keys(userStore.loginUserInfo).length > 0) {
    login(1)
    return
  } else {
    router.push('/newPost')
  }
}

//去往消息中心
const gotoMessage = (type) => {
  router.push(`/user/message/${type}`)
}

const loadMessageCount = async () => {
  let {
    data: { data }
  } = await userLoginAndRegisterService(api.getMessageCount)
  userStore.setMessageCountInfo(data)
}

watch(
  () => userStore.loginUserInfo,
  (newVal) => {
    if (!Object.keys(newVal).length > 0) {
      return
    }
    loadMessageCount()
  },
  { immediate: true, deep: true }
)

//获取系统配置
const loadSyeSetting = async () => {
  let {
    data: { data }
  } = await userLoginAndRegisterService(api.getSysSetting)
  sysStore.saveSysSetting(data)
}

//去往搜索页
const goSearch = () => {
  router.push('/search')
}

const showFooter = ref(true)

watch(
  () => route.path,
  (newVal) => {
    if (newVal.indexOf('newPost') != -1 || newVal.indexOf('editPost') != -1) {
      showFooter.value = false
    } else {
      showFooter.value = true
    }
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="header" v-if="showHeader">
    <div
      class="header-content"
      :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
    >
      <!-- logo -->
      <RouterLink to="/" class="logo">
        <span
          v-for="item in logoInfo"
          :key="item.id"
          :style="{ color: item.color }"
          >{{ item.letter }}</span
        >
      </RouterLink>

      <!-- 版块信息 -->
      <div class="menu-panel">
        <router-link
          :class="[
            'menu-item homeIndex',
            boardStore.activepBoardId == undefined ? 'active' : ''
          ]"
          to="/"
          >首页</router-link
        >
        <template v-for="item in boardList" :key="item.boardId">
          <el-popover
            placement="bottom-start"
            :width="300"
            trigger="hover"
            v-if="item.children.length"
          >
            <template #reference>
              <span
                :class="[
                  'menu-item',
                  item.boardId == boardStore.activepBoardId ? 'active' : ''
                ]"
                @click="boardClickHandler(item)"
                >{{ item.boardName }}</span
              >
            </template>
            <div class="sub-board-list">
              <span
                @click="subBoardClickHandler(subItem)"
                :class="[
                  'sub-board',
                  subItem.boardId == boardStore.activeBoardId ? 'active' : ''
                ]"
                v-for="subItem in item.children"
                :key="subItem.boardId"
                >{{ subItem?.boardName }}</span
              >
            </div>
          </el-popover>
          <span
            :class="[
              'menu-item',
              item.boardId == boardStore.activepBoardId ? 'active' : ''
            ]"
            v-else
            @click="boardClickHandler(item)"
            >{{ item.boardName }}</span
          >
        </template>
      </div>
      <!-- 登录注册用户信息 -->
      <div class="userInfo-panel">
        <el-button type="primary" class="op-btn" @click="newPost">
          发帖<span class="iconfont icon-add"></span>
        </el-button>
        <el-button type="primary" class="op-btn" @click="goSearch">
          搜索<span class="iconfont icon-search"></span>
        </el-button>
        <template v-if="userStore.loginUserInfo.userId">
          <div class="message-info">
            <el-dropdown>
              <el-badge
                :value="userStore.messageCountInfo.total"
                class="item"
                :hidden="
                  userStore.messageCountInfo.total == null ||
                  userStore.messageCountInfo.total == 0
                "
              >
                <div class="iconfont icon-message"></div>
              </el-badge>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    @click="gotoMessage('reply')"
                    class="message-item"
                  >
                    <span class="text">回复我的</span>
                    <span
                      class="count-tag"
                      v-if="userStore.messageCountInfo.reply > 0"
                      >{{
                        userStore.messageCountInfo.reply > 99
                          ? '99+'
                          : userStore.messageCountInfo.reply
                      }}</span
                    >
                  </el-dropdown-item>
                  <el-dropdown-item
                    class="message-item"
                    @click="gotoMessage('likePost')"
                  >
                    <span class="text">赞了我的文章</span>
                    <span
                      class="count-tag"
                      v-if="userStore.messageCountInfo.likePost > 0"
                      >{{
                        userStore.messageCountInfo.likePost > 99
                          ? '99+'
                          : userStore.messageCountInfo.likePost
                      }}</span
                    >
                  </el-dropdown-item>
                  <el-dropdown-item
                    class="message-item"
                    @click="gotoMessage('downloadAttachment')"
                  >
                    <span class="text">下载了我的附件</span>
                    <span
                      class="count-tag"
                      v-if="userStore.messageCountInfo.downloadAttachment > 0"
                      >{{
                        userStore.messageCountInfo.downloadAttachment > 99
                          ? '99+'
                          : userStore.messageCountInfo.downloadAttachment
                      }}</span
                    ></el-dropdown-item
                  >
                  <el-dropdown-item
                    class="message-item"
                    @click="gotoMessage('likeComment')"
                  >
                    <span class="text">赞了我的评论</span>
                    <span
                      class="count-tag"
                      v-if="userStore.messageCountInfo.likeComment > 0"
                      >{{
                        userStore.messageCountInfo.likeComment > 99
                          ? '99+'
                          : userStore.messageCountInfo.likeComment
                      }}</span
                    ></el-dropdown-item
                  >
                  <el-dropdown-item
                    @click="gotoMessage('sys')"
                    class="message-item"
                  >
                    <span class="text">系统消息</span>
                    <span
                      class="count-tag"
                      v-if="userStore.messageCountInfo.sys > 0"
                      >{{
                        userStore.messageCountInfo.sys > 99
                          ? '99+'
                          : userStore.messageCountInfo.sys
                      }}</span
                    ></el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="avatar-info">
            <AvatarCom
              v-if="userStore.loginUserInfo.userId"
              :userId="userStore.loginUserInfo.userId"
              :showDrop="true"
            ></AvatarCom>
          </div>
        </template>
        <el-button-group :style="{ 'margin-left': '10px' }" v-else>
          <el-button type="primary" plain @click="login(1)">登录</el-button>
          <el-button type="primary" plain @click="login(0)">注册</el-button>
        </el-button-group>
      </div>
    </div>
  </div>
  <!-- <Dialog-com :show="showDia" :buttons="buttons" @soncloseDia="showDia = false">这里是内容<div></div></Dialog-com> -->
  <div class="body-content">
    <router-view></router-view>
  </div>
  <div class="footer" v-if="showFooter">
    <div
      class="footer-content"
      :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
    >
      <el-row>
        <el-col :span="6" class="item">
          <div class="logo">
            <div class="logo-letter">
              <span
                v-for="item in logoInfo"
                :key="item.id"
                :style="{ color: item.color }"
                >{{ item.letter }}</span
              >
            </div>
            <div class="info">随便写写的社区</div>
          </div>
        </el-col>
        <el-col :span="6" class="item">
          <div class="title">网站相关</div>
          <div>
            <div><a href="#">网站相关</a></div>
            <div><a href="#">网站相关</a></div>
            <div><a href="#">网站相关</a></div>
            <div><a href="#">网站相关</a></div>
          </div>
        </el-col>
        <el-col :span="6" class="item">
          <div class="title">友情链接</div>
        </el-col>
        <el-col :span="6" class="item">
          <div class="title">关注站长</div>
        </el-col>
      </el-row>
    </div>
  </div>
  <LoginAndRegister ref="loginRegisterRef"></LoginAndRegister>
  <!-- 回到顶部 -->
  <el-backtop :right="180" :bottom="100"></el-backtop>
</template>

<style lang="scss">
.header {
  top: 0px;
  width: 100%;
  position: fixed;
  box-shadow: 0 2px 6px 0 #ddd;
  background: #fff;
  z-index: 2;
  .header-content {
    margin: 0px auto;
    height: 60px;
    align-items: center;
    display: flex;
    .logo {
      display: block;
      margin-right: 5px;
      text-decoration: none;
      font-size: 30px;
    }
    .menu-panel {
      flex: 1;
      .menu-item {
        cursor: pointer;
        margin-left: 20px;
      }
      .homeIndex {
        text-decoration: none;
        color: #000;
      }
      .active {
        color: var(--link);
      }
    }
    .userInfo-panel {
      width: 310px;
      display: flex;
      align-items: center;
      .op-btn {
        .confont {
          margin-left: 5px;
        }
      }
      .message-info {
        .icon-message {
          font-size: 25px;
          color: rgb(147, 147, 147);
          margin-left: 20px;
        }
      }
      .avatar-info {
        margin-left: 30px;
      }
    }
  }
}
.sub-board-list {
  display: flex;
  flex-wrap: wrap;
  .sub-board {
    padding: 0px 10px;
    border-radius: 20px;
    margin-left: 10px;
    background: #ddd;
    border: 1px solid #ddd;
    color: #838080;
    margin-top: 10px;
    cursor: pointer;
  }
  .sub-board:hover {
    color: var(--link);
  }
  .active {
    background: var(--link);
    color: #fff;
  }
  .active:hover {
    color: #fff;
  }
}
.body-content {
  margin-top: 60px;
  position: relative;
  min-height: calc(100vh - 220px);
}
.message-item {
  display: flex;
  justify-content: space-around;
  .text {
    flex: 1;
  }
  .count-tag {
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
.footer {
  background: #e9e9e9;
  height: 140px;
  margin-top: 10px;
  .footer-content {
    margin: 0px auto;
    padding-top: 10px;
    .item {
      text-align: left;
      .title {
        font-size: 18px;
        margin-bottom: 10px;
      }
      a {
        font-size: 14px;
        text-decoration: none;
        color: var(--text2);
        line-height: 25px;
      }
    }
    .logo {
      .logo-letter {
        font-size: 30px;
      }
      .info {
        margin-top: 10px;
        color: #817e7e;
      }
    }
  }
}
</style>
