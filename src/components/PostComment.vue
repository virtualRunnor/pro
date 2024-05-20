<script setup>
import { useUserStore } from '@/stores'
import { userLoginAndRegisterService } from '@/api/register'
import { inject, ref } from 'vue'
import { ElMessage } from 'element-plus'
import CommentImage from '@/views/forum/CommentImage.vue'
import { formDataUtil } from '@/utils/dataUtils'
const userStore = useUserStore()
const api = {
  postComment: '/comment/postComment'
}
//form信息
const checkPostComment = (rule, value, callback) => {
  if (value == null && formData.value.image == null) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}

const formData = ref({})
const formDataRef = ref()
const rules = {
  content: [
    { required: true, message: '请输入评论内容', validator: checkPostComment },
    { min: 5, message: '评论至少5个字' }
  ]
}

const showLoginPanel = inject('useShowPanel')

const emit = defineEmits(['postCommentFinish'])
const postCommentDo = async () => {
  if (!Object.keys(userStore.loginUserInfo).length > 0) {
    showLoginPanel(1)
    return
  }
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = Object.assign({}, formData.value)
    params.articleId = props.articleId
    params.pCommentId = props.pCommentId
    params.replyUserId = props.replyUserId ? props.replyUserId : null
    params = formDataUtil(params)
    const {
      data: { data }
    } = await userLoginAndRegisterService(api.postComment, params)
    formDataRef.value.resetFields()
    removeCommentImg()
    ElMessage.success('评论提交成功，快去看看吧！')
    emit('postCommentFinish', data)
  })
}

//选择图片
const commentImg = ref(null)
const selectImg = (file) => {
  file = file.file
  let img = new FileReader()
  img.readAsDataURL(file)
  img.onload = ({ target }) => {
    let imgData = target.result
    commentImg.value = imgData
    formData.value.image = file
  }
}
const removeCommentImg = () => {
  commentImg.value = null
  formData.value.image = null
}

const props = defineProps({
  pCommentId: {
    type: Number
  },
  articleId: {
    type: String
  },
  showInsertImg: {
    type: Boolean
  },
  placeholder: {
    type: String,
    default: '踊跃发言，我当人先！'
  },
  replyUserId: {
    type: String
  }
})
</script>

<template>
  <div class="post-comment-panel">
    <AvatarCom :size="50" :userId="userStore.loginUserInfo.userId"></AvatarCom>
    <div class="comment-form">
      <el-form
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        @submit.prevent
      >
        <!--textarea输入-->
        <el-form-item prop="content">
          <el-input
            clearable
            :placeholder="placeholder"
            type="textarea"
            :maxlength="800"
            resize="none"
            show-word-limit
            v-model.trim="formData.content"
          ></el-input>
          <div
            class="insert-img"
            v-if="userStore.loginUserInfo.userId && showInsertImg"
          >
            <div class="pre-img" v-if="commentImg">
              <CommentImage :src="commentImg"></CommentImage>
              <span
                class="iconfont icon-remove"
                @click="removeCommentImg"
              ></span>
            </div>
            <el-upload
              v-else
              name="file"
              :show-file-list="false"
              accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
              :multiple="false"
              :http-request="selectImg"
            >
              <span class="iconfont icon-image"></span>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div class="send-btn" @click="postCommentDo">发表</div>
  </div>
</template>

<style lang="scss">
.post-comment-panel {
  display: flex;
  align-items: top;
  .comment-form {
    flex: 1;
    margin: 0px 10px;
    padding-left: 10px;
    .el-textarea__inner {
      height: 60px;
    }
    .insert-img {
      line-height: normal;
      .iconfont {
        margin-top: 3px;
        font-size: 20px;
        color: rgb(136, 136, 136);
      }
      .pre-img {
        cursor: pointer;
        margin-top: 10px;
        position: relative;
        .iconfont {
          position: absolute;
          top: -10px;
          right: -10px;
          color: rgb(122, 117, 117);
        }
      }
    }
  }
  .send-btn {
    width: 60px;
    height: 60px;
    background: var(--link);
    color: #fff;
    text-align: center;
    line-height: 60px;
    border-radius: 5px;
    cursor: pointer;
  }
}
</style>
