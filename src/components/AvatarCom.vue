<script setup>
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { userLoginAndRegisterService } from '@/api/register'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores'
const userStore = useUserStore()
const router = useRouter()

//未登录时登录
const showLoginPanel = inject('useShowPanel')

const toLogin = () => {
  showLoginPanel(1)
}

const props = defineProps({
  userId: {
    type: String
  },
  size: {
    type: Number,
    default: 50
  },
  addLink: {
    type: Boolean,
    default: false
  },
  showDrop: {
    type: Boolean,
    default: false
  }
})

const goToUserCenter = (type) => {
  if (props.addLink || type === 1) {
    router.push(`/user/${props.userId}`)
  }
}

const loginOut = async () => {
  await ElMessageBox.confirm('确认要退出吗？', '退出', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await userLoginAndRegisterService('/logout')
  userStore.setLoginUserInfo({})
  router.push('/')
}
</script>

<template>
  <div class="avatar" v-if="userId" @click="goToUserCenter">
    <el-dropdown v-if="showDrop">
      <el-avatar
        :size="size"
        :src="`/api/file/getAvatar/${props.userId}`"
        fit="cover"
      />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="goToUserCenter(1)"
            >我的主页</el-dropdown-item
          >
          <el-dropdown-item @click="loginOut">退出</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-avatar
      v-else
      :size="size"
      :src="`/api/file/getAvatar/${props.userId}`"
      fit="cover"
    />
  </div>
  <div
    @click="toLogin"
    class="no-login"
    :style="{ width: size + 'px', height: size + 'px' }"
    v-else
  >
    未登录
  </div>
</template>

<style lang="scss">
.avatar {
  display: flex;
  cursor: pointer;
}
.no-login {
  overflow: hidden;
  display: flex;
  align-items: center;
  background: #f0f0f0;
  width: 100%;
  text-align: center;
  font-size: 13px;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
}
</style>
