<script setup>
import { formDataUtil } from '@/utils/dataUtils'
import { ref, reactive, nextTick, getCurrentInstance } from 'vue'
import { userLoginAndRegisterService } from '@/api/register'
import { useUserStore } from '@/stores'
const userStore = useUserStore()
import md5 from 'js-md5'
const opType = ref()
const { proxy } = getCurrentInstance()
const api = {
  checkCode: '/api/checkCode',
  sendEmailCode: '/sendEmailCode',
  registerApi: '/register',
  loginApi: '/login',
  resetPwdApi: '/resetPwd',
  getUserInfo: '/getUserInfo'
}
//控制显示的Dialog

const showPanel = (type) => {
  opType.value = type
  dialogConfig.show = true
  if (opType.value === 1) {
    dialogConfig.title = '登录'
  } else if (opType.value === 0) {
    dialogConfig.title = '注册'
  } else if (opType.value === 2) {
    dialogConfig.title = '重置密码'
    emailFormData.value.type = '1'
  }
  nextTick(() => {
    changeCheckCode(0)
    formDataRef.value.resetFields()
    formData.value = {}
    if (opType.value === 1) {
      const loginInfo = proxy.VueCookies.get('loginInfo')
      if (loginInfo) {
        formData.value = loginInfo
      }
    }
  })
}

//注册内嵌Dialog
const emailFormDataRef = ref()
const emailFormData = ref({})
const dialogConfig = reactive({
  show: false,
  title: '标题'
})
const dialogConfigEmail = reactive({
  show: false,
  title: '发送邮箱验证码'
})

//控制密码眼
const iconEye = reactive({
  passwordEye: false,
  repasswordEye: true
})
const changeEyeType = (type) => {
  iconEye[type] = !iconEye[type]
}

//输入框校验
const formData = ref({
  email: '',
  emailCode: '',
  nickName: '',
  password: '',
  repassword: '',
  checkCode: ''
})
const formDataRef = ref()
const rules = {
  email: [
    { required: true, message: '请输入邮箱' },
    {
      validator: (rule, value, callback) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
        if (!emailRegex.test(value)) {
          callback(new Error('请输入正确的邮箱格式'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  emailCode: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }],
  nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (opType.value === '0') {
          const passwordRegex =
            /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,18}$/
          if (!passwordRegex.test(value)) {
            callback(
              new Error('密码必须包含字母、数字和特殊字符，且长度为8-18位')
            )
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  repassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  checkCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

//获取邮箱验证码
const getEmailCode = () => {
  formDataRef.value.validateField('email', (valid) => {
    if (!valid) {
      return
    }
    dialogConfigEmail.show = true
    nextTick(() => {
      emailFormDataRef.value.resetFields()
      changeCheckCode(1)
      if (dialogConfig.title === '注册') {
        emailFormData.value = {
          email: formData.value.email,
          type: '0'
        }
      } else {
        emailFormData.value = {
          email: formData.value.email,
          type: '1'
        }
      }
    })
  })
}
const sendEmailCode = async () => {
  await emailFormDataRef.value.validate()
  const fd = formDataUtil(emailFormData.value)
  await userLoginAndRegisterService(api.sendEmailCode, fd)
  changeCheckCode(1)
}

//验证码
const chechCodeUrl = ref(api.checkCode)
const chechCodeUrlEmail = ref(api.checkCode)
const changeCheckCode = (type) => {
  if (type === 0) {
    chechCodeUrl.value =
      api.checkCode + '?type=' + type + '&time=' + new Date().getTime()
  } else {
    chechCodeUrlEmail.value =
      api.checkCode + '?type=' + type + '&time=' + new Date().getTime()
  }
}

//注册
const register = async () => {
  await formDataRef.value.validate()
  const fd = formDataUtil(formData.value)
  await userLoginAndRegisterService(api.registerApi, fd)
  ElMessage.success('注册成功,请去登录')
  changeCheckCode(0)
  showPanel(1)
}

//登录
const login = async () => {
  await formDataRef.value.validate()
  let cookieLoginInfo = proxy.VueCookies.get('loginInfo')
  let cookiePassword =
    cookieLoginInfo === null ? null : cookieLoginInfo.password
  const params = {}
  Object.assign(params, formData.value)
  if (params.password !== cookiePassword) {
    params.password = md5(params.password)
  }
  const fd = formDataUtil(params)
  const {
    data: { data }
  } = await userLoginAndRegisterService(api.loginApi, fd)
  userStore.setLoginUserInfo(data)
  if (formData.value.remeberMe) {
    const loginInfo = {
      email: params.email,
      password: params.password,
      remeberMe: params.remeberMe
    }
    proxy.VueCookies.set('loginInfo', loginInfo, '7d')
  } else {
    proxy.VueCookies.remove('loginInfo')
  }
  dialogConfig.show = false
}

//重置密码
const resetPwd = async () => {
  await formDataRef.value.validate()
  const fd = formDataUtil(formData.value)
  const res = await userLoginAndRegisterService(api.resetPwdApi, fd)
  showPanel(1)
  console.log(res)
  nextTick(() => {
    changeCheckCode(0)
  })
}

defineExpose({ showPanel })
</script>

<template>
  <div>
    <Dialog-com
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="400px"
      :showCancel="false"
      @close="dialogConfig.show = false"
    >
      <el-form
        class="login-register"
        size="large"
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        @submit.prevent
      >
        <!--输入邮箱-->
        <el-form-item label="" prop="email">
          <el-input
            clearable
            placeholder="请输入邮箱"
            v-model.trim="formData.email"
            maxLength="150"
          >
            <template #prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 输入邮箱验证码 -->
        <el-form-item
          label=""
          prop="emailCode"
          v-if="(opType == 0) | (opType == 2)"
        >
          <div class="check-code-panel">
            <el-input
              clearable
              placeholder="请输入邮箱验证码"
              v-model.trim="formData.emailCode"
            >
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <el-button @click="getEmailCode" type="primary" class="email-code"
              >获取验证码</el-button
            >
          </div>
          <el-popover placement="bottom" :width="450" trigger="hover">
            <template #reference>
              <span class="a-link op-link" :style="{ 'font-size': '14px' }"
                >未收到邮箱验证码？</span
              >
            </template>
            <div>
              <p>1、在垃圾箱中查找邮箱验证码</p>
              <p>2、在邮箱中 头像->设置->反垃圾->白名单->设置邮件地址白名单</p>
              <p>3、将邮箱【我的邮箱】添加到白名单</p>
              <a href="javascript:void(0)" class="a-link op-link"
                >不知道怎么设置？</a
              >
            </div>
          </el-popover>
        </el-form-item>
        <!--输入昵称-->
        <el-form-item label="" prop="nickName" v-if="opType == 0">
          <el-input
            clearable
            placeholder="请输入昵称"
            v-model.trim="formData.nickName"
            maxLength="20"
          >
            <template #prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 输入密码 -->
        <el-form-item label="" prop="password">
          <el-input
            :type="iconEye.passwordEye ? 'text' : 'password'"
            clearable
            placeholder="请输入密码"
            v-model.trim="formData.password"
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
            <template #suffix>
              <span
                @click="changeEyeType('passwordEye')"
                :class="[
                  'iconfont',
                  iconEye.passwordEye ? 'icon-eye' : 'icon-close-eye'
                ]"
              ></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 再次输入密码 -->
        <el-form-item
          label=""
          prop="repassword"
          v-if="(opType == 0) | (opType == 2)"
        >
          <el-input
            :type="iconEye.repasswordEye ? 'text' : 'password'"
            clearable
            placeholder="请再次输入密码"
            v-model.trim="formData.repassword"
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
            <template #suffix>
              <span
                @click="changeEyeType('repasswordEye')"
                :class="[
                  'iconfont',
                  iconEye.repasswordEye ? 'icon-eye' : 'icon-close-eye'
                ]"
              ></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 输入验证码 -->
        <el-form-item label="" prop="checkCode">
          <div class="check-code-panel">
            <el-input
              clearable
              placeholder="请输入验证码"
              v-model.trim="formData.checkCode"
            >
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img
              :src="chechCodeUrl"
              class="check-code"
              alt=""
              @click="changeCheckCode(0)"
            />
          </div>
        </el-form-item>
        <!-- 记住我 -->
        <el-form-item>
          <div class="remember-check" v-if="opType == 1">
            <el-checkbox v-model="formData.remeberMe">记住我</el-checkbox>
          </div>
          <div :style="{ width: '100%' }">
            <a
              href="javascript:void(0)"
              class="a-link op-link"
              v-if="opType == 0"
              @click="showPanel(1)"
              >已有账号？</a
            >
            <a
              href="javascript:void(0)"
              class="a-link op-link"
              v-if="opType == 2"
              @click="showPanel(1)"
              >去登录？</a
            >
            <div v-if="opType == 1" class="no-account">
              <a
                href="javascript:void(0)"
                class="a-link op-link"
                @click="showPanel(2)"
                >忘记密码？</a
              >
              <a href="javascript:void(0)" class="a-link" @click="showPanel(0)"
                >没有账号？</a
              >
            </div>
          </div>
        </el-form-item>
        <!-- 登录/注册/重置密码按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            class="op-btn"
            @click="register"
            v-if="opType == 0"
            >注册</el-button
          >
          <el-button
            type="primary"
            class="op-btn"
            v-if="opType == 1"
            @click="login"
            >登录</el-button
          >
          <el-button
            type="primary"
            class="op-btn"
            v-if="opType == 2"
            @click="resetPwd"
            >重置密码</el-button
          >
        </el-form-item>
      </el-form>
    </Dialog-com>
    <Dialog-com
      :show="dialogConfigEmail.show"
      :title="dialogConfigEmail.title"
      :buttons="dialogConfigEmail.buttons"
      width="500px"
      :showCancel="false"
      @close="dialogConfigEmail.show = false"
    >
      <el-form
        label-width="80px"
        :model="emailFormData"
        :rules="rules"
        ref="emailFormDataRef"
      >
        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="checkCode">
          {{ formData.email }}
        </el-form-item>
        <!-- 输入验证码 -->
        <el-form-item label="验证码" prop="checkCode">
          <div class="check-code-panel">
            <el-input
              clearable
              placeholder="请输入验证码"
              v-model.trim="emailFormData.checkCode"
            >
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img
              :src="chechCodeUrlEmail"
              class="check-code"
              alt=""
              @click="changeCheckCode(1)"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button class="email-btn" type="primary" @click="sendEmailCode"
            >发送验证码</el-button
          >
        </el-form-item>
      </el-form>
    </Dialog-com>
  </div>
</template>

<style lang="scss">
.login-register {
  .remember-check {
    width: 100%;
  }
  .no-account {
    margin-top: 5px;
    display: flex;
    width: 100%;
    justify-content: space-between;
  }
  .op-btn {
    width: 100%;
  }
  .op-link {
    margin-left: 10px;
  }
  .email-code {
    margin-left: 20px;
  }
}
.check-code-panel {
  display: flex;
  .check-code {
    margin-left: 5px;
    cursor: pointer;
  }
}
</style>
