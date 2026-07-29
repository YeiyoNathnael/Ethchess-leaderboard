<template>
  <div class="logo-mark" :style="{ width: size + 'px', height: size + 'px' }">
    <img src="/logo.png" alt="EthChess Logo" class="logo-img" />
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: Number,
    default: 140
  }
});
</script>

<style scoped>
.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
