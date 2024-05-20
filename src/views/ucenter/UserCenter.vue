<script setup>
import { ref, getCurrentInstance, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userLoginAndRegisterService } from '@/api/register'
import AvatarCom from '@/components/AvatarCom.vue'
import { useUserStore, useBoardStore } from '@/stores'
import ArticleItem from '@/views/components/ArticleItem.vue'
import UserIngtegralRecord from '@/views/ucenter/UserIngtegralRecord.vue'
import UenterEditUserInfo from '@/views/ucenter/UenterEditUserInfo.vue'

const api = {
  getUserInfo: '/ucenter/getUserInfo',
  loadUserArticle: '/ucenter/loadUserArticle'
}
const userStore = useUserStore()
const boardStore = useBoardStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()
const userId = ref(null)
const userInfo = ref({})
onMounted(() => {
  userId.value = route.params.userId
  loadUserInfo()
  boardStore.setActivepBoardId(-1)
})

const loadUserInfo = async () => {
  let res = await userLoginAndRegisterService(
    api.getUserInfo,
    {
      userId: userId.value
    },
    {
      errCallback: () => {
        setTimeout(() => {
          router.push('/')
        }, 1500)
      }
    }
  )
  if (!res) {
    return
  }
  userInfo.value = res.data.data
}

//右侧文章
const activeTabName = ref('0')
const changeTab = (type) => {
  activeTabName.value = type
  getloadArticle()
}

const articleInfoList = ref({})
const loading = ref(false)
const getloadArticle = async () => {
  loading.value = true
  let params = {
    pageNo: articleInfoList.value.pageNo,
    type: activeTabName.value,
    userId: userId.value
  }
  const {
    data: { data }
  } = await userLoginAndRegisterService(api.loadUserArticle, params)
  articleInfoList.value = data
  loading.value = false
}

onMounted(() => {
  getloadArticle()
})

//修改个人信息
const uenterEditUserInfoRef = ref()
const updateUserInfo = () => {
  uenterEditUserInfoRef.value.showEidiUserInfoDialog(userInfo.value)
}

const resetUserInfoHandler = (data) => {
  userInfo.value = data
}

//获取用户积分记录
const uenterIntegralRecordRef = ref()
const showIntegralRecord = () => {
  uenterIntegralRecordRef.value.showRecord()
}
</script>

<template>
  <div
    class="page-container ucenter"
    :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
  >
    <div class="user-banner">
      <router-link to="/" class="a-link">首页</router-link>
      <span class="iconfont icon-right"></span>
      <span>个人中心</span>
    </div>
    <div class="ucenter-panel">
      <div class="user-side">
        <!-- 头像信息 -->
        <div class="avatar-panel">
          <div
            class="edit-btn a-link"
            v-if="userStore.loginUserInfo.userId == userId"
            @click="updateUserInfo"
          >
            修改资料
          </div>
          <div class="avatar-inner">
            <AvatarCom :userId="userInfo.userId" :size="120"></AvatarCom>
          </div>
          <div class="nick-name">
            <span>{{ userInfo.nickName }}</span>
            <span v-if="userInfo.sex == 0" class="iconfont icon-woman"></span>
            <span v-if="userInfo.sex == 1" class="iconfont icon-man"></span>
          </div>
          <div class="desc">
            {{ userInfo.personDescription }}
          </div>
        </div>
        <!-- 扩展信息 -->
        <div class="user-extend-panel">
          <div class="info-item">
            <div class="label iconfont icon-integral">积分</div>
            <div
              class="value a-link"
              @click="showIntegralRecord"
              v-if="userStore.loginUserInfo.userId == userId"
            >
              {{ userInfo.currentIntegral }}
            </div>
            <div v-else class="value">{{ userInfo.currentIntegral }}</div>
          </div>
          <div class="info-item">
            <div class="label iconfont icon-like">获赞</div>
            <div class="value">{{ userInfo.likeCount }}</div>
          </div>
          <div class="info-item">
            <div class="label iconfont icon-post">发帖</div>
            <div class="value">{{ userInfo.postCount }}</div>
          </div>
          <div class="info-item">
            <div class="label iconfont icon-register">加入</div>
            <div class="value">{{ userInfo.joinTime }}</div>
          </div>
          <div class="info-item">
            <div class="label iconfont icon-login">最后登入</div>
            <div class="value">{{ userInfo.lastLoginTime }}</div>
          </div>
        </div>
      </div>
      <div class="article-panel">
        <el-tabs v-model="activeTabName" @tab-change="changeTab">
          <el-tab-pane label="发帖" name="0"></el-tab-pane>
          <el-tab-pane label="评论" name="1"></el-tab-pane>
          <el-tab-pane label="点赞" name="2"></el-tab-pane>
        </el-tabs>
        <div class="article-list">
          <DataList
            :loading="loading"
            :dataSource="articleInfoList"
            @loadDate="getloadArticle"
            noDataMsg="没有发现文章，赶紧来成为第一个吧！"
          >
            <template #default="{ data }">
              <ArticleItem
                :data="data"
                :showEdit="
                  activeTabName == 0 && userStore.loginUserInfo.userId == userId
                "
              ></ArticleItem>
            </template>
          </DataList>
        </div>
      </div>
    </div>
    <!-- 修改用户信息 -->
    <UenterEditUserInfo
      ref="uenterEditUserInfoRef"
      @resetUserInfo="resetUserInfoHandler"
    ></UenterEditUserInfo>
    <!-- 查看积分明细 -->
    <UserIngtegralRecord ref="uenterIntegralRecordRef"></UserIngtegralRecord>
  </div>
</template>

<style lang="scss">
.ucenter {
  z-index: 1;
  .user-banner {
    color: #9ba7b9;
    line-height: 35px;
    .icon-right {
      padding: 0px 5px;
    }
  }
  .ucenter-panel {
    display: flex;
    .user-side {
      width: 300px;
      margin-right: 10px;
      .avatar-panel {
        background: #fff;
        text-align: center;
        padding: 10px;
        .avatar-inner {
          display: flex;
          justify-content: center;
        }
        .edit-btn {
          text-align: right;
          font-size: 14px;
          cursor: pointer;
        }
        .nick-name {
          .iconfont {
            margin-left: 5px;
            color: var(--link);
          }
        }
        .desc {
          margin-top: 5px;
          text-align: left;
          font-size: 14px;
          color: #929393;
          text-indent: 2em;
        }
      }
      .user-extend-panel {
        margin-top: 10px;
        background: #fff;
        padding: 10px;
        .info-item {
          display: flex;
          justify-content: space-between;
          line-height: 30px;
          .label {
            font-size: 13px;
          }
          .label::before {
            font-size: 22px;
            color: #888888;
            padding-right: 5px;
          }
          .value {
            font-size: 13px;
          }
        }
      }
    }
    .article-panel {
      flex: 1;
      background: #fff;
      padding: 0px 10px 10px 10px;
    }
  }
}
</style>
