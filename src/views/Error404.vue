<script setup></script>

<template>
  <div class="error">
    <div class="info">404 Not Found</div>
    <div>
      <router-link to="/" class="a-link">返回首页</router-link>
    </div>
  </div>
</template>

<style lang="scss">
.error {
  text-align: center;
  padding-top: 200px;
  .info {
    font-size: 100px;
    color: black;
  }
}
</style>
