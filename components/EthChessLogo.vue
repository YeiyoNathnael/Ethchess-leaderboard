<template>
  <div class="logo-mark" :style="{ width: size + 'px', height: size + 'px' }">
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
      <!-- Jade Green Crown -->
      <path d="M 20 28 L 32 40 L 50 18 L 68 40 L 80 28 L 84 52 L 16 52 Z" fill="#00A86B" />
      <circle cx="20" cy="24" r="3" fill="#00A86B" />
      <circle cx="50" cy="14" r="3.5" fill="#00A86B" />
      <circle cx="80" cy="24" r="3" fill="#00A86B" />
      
      <!-- Crown Base Line -->
      <rect x="16" y="54" width="68" height="4" fill="#121815" />

      <!-- Black Knight Head Silhouette -->
      <path d="M 80 62 L 72 62 L 72 70 C 72 70 65 72 58 76 C 52 80 50 85 50 85 L 36 75 L 36 62 Z" fill="#121815" />
      <path d="M 80 62 L 72 62 L 72 78 C 72 88 64 96 52 98 L 30 98 C 26 98 24 94 26 90 L 32 78 L 28 62 L 80 62 Z" fill="#121815" />
      <!-- Sleek Eye Notch -->
      <ellipse cx="64" cy="72" rx="2.5" ry="5" fill="#FFFCF1" transform="rotate(-15 64 72)" />
      <!-- Knight Pedestal Bars -->
      <rect x="24" y="102" width="52" height="5" rx="1" fill="#121815" />
      <rect x="24" y="110" width="52" height="6" rx="1" fill="#121815" />
    </svg>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: Number,
    default: 40
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

.logo-svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
