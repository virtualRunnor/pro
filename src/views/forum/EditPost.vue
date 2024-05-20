<script setup>
import { ref, getCurrentInstance, watch, nextTick } from 'vue'
import { userLoginAndRegisterService } from '@/api/register'
import { useRoute, useRouter } from 'vue-router'
import { formDataUtil } from '@/utils/dataUtils'
import { ElMessageBox } from 'element-plus'
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()
const api = {
  loadBoard: '/forum/loadBoard4Post',
  postArticle: '/forum/postArticle',
  articleDetail4Update: '/forum/articleDetail4Update',
  updateArticle: '/forum/updateArticle'
}

const formData = ref({})
const formDataRef = ref()
const rules = {
  title: [{ required: true, message: '请输入标题' }],
  boardIds: [{ required: true, message: '请选择版块' }],
  content: [{ required: true, message: '请输入正文' }],
  integral: [
    { required: true, message: '请输入下载所需积分' },
    {
      pattern: /^[0-9]+$/,
      message: '积分必须是数字'
    }
  ]
}

//编辑器类型
const markdownHeight = window.innerHeight - 60 - 80
const htmlEditorHeight = window.innerHeight - 80 - 140
const editorType = ref(null) //0是富文本 1是markdown
const changeEditor = async () => {
  await ElMessageBox.confirm(
    '切换编辑器会清空正在编辑的内容，确定要切换吗？',
    '附件下载',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  editorType.value = editorType.value == 0 ? 1 : 0
  formData.value.content = ''
  formData.value.markdownContent = ''
  proxy.VueCookies.set('editorType', editorType.value, -1)
}

//提交信息
const postHandler = async () => {
  await formDataRef.value.validate()
  let params = {}
  Object.assign(params, formData.value)
  //设置版块
  if (params.boardIds.length == 1) {
    params.pBoardId = params.boardIds[0]
  } else if (params.boardIds.length == 2) {
    params.pBoardId = params.boardIds[0]
    params.boardId = params.boardIds[1]
  }
  delete params.boardIds
  //设置编辑器类型
  params.editorType = editorType.value
  //获取内容
  const contentText = params.content.replace(/<(?!img).*?>/g, '')
  if (contentText == '') {
    ElMessage.error('内容不能为空')
    return
  }
  if (params.attachment != null) {
    params.attachmentType = 1
  } else {
    params.attachmentType = 0
  }
  //封面
  if (!(params.cover instanceof File)) {
    delete params.cover
  }
  //附件不是文件类型，设置为空
  if (!(params.attachment instanceof File)) {
    delete params.attachment
  }
  params = formDataUtil(params)
  let res = await userLoginAndRegisterService(
    params.articleId ? api.updateArticle : api.postArticle,
    params
  )
  console.log(res)
  ElMessage.success('保存成功')
  router.push(`/post/${res.data.data}`)
}

//版块信息
const boardProps = {
  multiple: false,
  checkStrictly: true,
  value: 'boardId',
  label: 'boardName'
}

//监听路由参数
const articleId = ref(null)
const getArticleDetail = () => {
  console.log('发生了监听')
  nextTick(async () => {
    formDataRef.value.resetFields()
    if (articleId.value) {
      //修改
      let params = {
        articleId: articleId.value
      }
      let res = await userLoginAndRegisterService(
        api.articleDetail4Update,
        params,
        {
          errCallback: (res) => {
            ElMessageBox.alert(res.data.info, '错误', {
              'show-close': false,
              callback: () => {
                router.go(-1)
              }
            })
          }
        }
      )
      let articleInfo = res.data.data.forumArticle

      //设置编辑器
      editorType.value = articleInfo.editorType
      //设置版块信息
      articleInfo.boardIds = []
      articleInfo.boardIds.push(articleInfo.pBoardId)
      if (articleInfo.boardId != null && articleInfo.boardId != 0) {
        articleInfo.boardIds.push(articleInfo.boardId)
      }
      //设置封面信息
      if (articleInfo.cover) {
        articleInfo.cover = { imageUrl: articleInfo.cover }
      }
      //设置附件
      if (res.data.data.attachment) {
        articleInfo.attachment = {
          name: res.data.data.attachment.fileName
        }
        articleInfo.integral = res.data.data.attachment.integral
      }
      formData.value = articleInfo
    } else {
      //新增
      formData.value = {}
      editorType.value = proxy.VueCookies.get('editorType') || 0
    }
  })
}

//设置markdown编辑器的富文本信息
const setHtmlContent = (htmlContent) => {
  formData.value.content = htmlContent
}

watch(
  () => route,
  (newVal) => {
    if (
      newVal.path.indexOf('/editPost') != -1 ||
      newVal.path.indexOf('/newPost') != -1
    ) {
      articleId.value = newVal.params.articleId
      getArticleDetail()
    }
  },
  { immediate: true, deep: true }
)

const boardList = ref([])
const loadBoardList = async () => {
  let {
    data: { data }
  } = await userLoginAndRegisterService(api.loadBoard)
  boardList.value = data
}
loadBoardList()
</script>

<template>
  <div class="edit-post">
    <el-form
      class="post-panel"
      :model="formData"
      :rules="rules"
      ref="formDataRef"
      label-width="60px"
    >
      <!-- 左侧 -->
      <div class="post-editor">
        <el-card :body-style="{ padding: '5px' }">
          <template #header>
            <div class="post-editor-title">
              <span>正文</span>
              <div class="change-editor-type">
                <span class="iconfont icon-change" @click="changeEditor">
                  切换为{{
                    editorType == 0 ? 'markdown编辑器' : '富文本编辑器'
                  }}
                </span>
              </div>
            </div>
          </template>

          <el-form-item prop="content" label-width="0">
            <EditorHtml
              :height="htmlEditorHeight"
              v-model="formData.content"
              v-if="editorType == 0"
            ></EditorHtml>
            <EditorMarkDown
              v-model="formData.markdownContent"
              :height="markdownHeight"
              v-if="editorType == 1"
              @htmlContent="setHtmlContent"
            ></EditorMarkDown>
          </el-form-item>
        </el-card>
      </div>
      <!-- 右侧 -->
      <div class="post-setting">
        <el-card :body-style="{ padding: '5px' }">
          <template #header>
            <span>设置</span>
          </template>
          <div class="setting-inner">
            <!-- input输入 -->
            <el-form-item label="标题" prop="title">
              <el-input
                clearable
                :maxlength="150"
                placeholder="提示信息"
                v-model.trim="formData.title"
              ></el-input>
            </el-form-item>
            <el-form-item prop="boardIds" label="板块">
              <el-cascader
                placeholder="请选择版块"
                :options="boardList"
                :props="boardProps"
                clearable
                v-model="formData.boardIds"
                :style="{ width: '100%' }"
              />
            </el-form-item>
            <el-form-item prop="cover" label="封面">
              <CoverUpload v-model="formData.cover"></CoverUpload>
            </el-form-item>
            <!--textarea输入-->
            <el-form-item label="摘要" prop="sammary">
              <el-input
                clearable
                placeholder="提示信息"
                type="textarea"
                :rows="5"
                :maxlength="200"
                resize="none"
                show-word-limit
                v-model="formData.summary"
              ></el-input>
            </el-form-item>
            <el-form-item prop="cover" label="附件">
              <AttachmentSelect
                v-model="formData.attachment"
              ></AttachmentSelect>
            </el-form-item>
            <!--input输入-->
            <el-form-item
              label="积分"
              prop="integral"
              v-if="formData.attachment"
            >
              <el-input
                clearable
                placeholder="请输入积分"
                v-model="formData.integral"
              ></el-input>
              <span class="tips">附件下载积分，0表示无需积分下载</span>
            </el-form-item>
            <el-form-item>
              <el-button
                @click="postHandler"
                type="primary"
                :style="{ width: '100%' }"
                >保存</el-button
              >
            </el-form-item>
          </div>
        </el-card>
      </div>
    </el-form>
  </div>
</template>

<style lang="scss">
.edit-post {
  .post-panel {
    display: flex;
    .el-card__header {
      padding: 10px;
    }
    .post-editor {
      flex: 1;
      .post-editor-title {
        display: flex;
        justify-content: space-between;
        .change-editor-type {
          .iconfont {
            cursor: pointer;
            color: var(--link);
            font-size: 14px;
          }
        }
      }
    }
    .post-setting {
      margin-left: 10px;
      width: 450px;
      .setting-inner {
        max-height: calc(100vh - 120px);
        overflow: auto;
        .el-form-item {
          align-items: flex-start;
        }
        .tips {
          color: #917f7f;
          font-size: 13px;
        }
      }
    }
  }
}
</style>
