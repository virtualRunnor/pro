<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn.mjs'
</script>

<template>
  <el-config-provider :locale="zhCn" :message="{ max: 1 }">
    <router-view></router-view>
  </el-config-provider>
</template>

<style lang="scss"></style>
