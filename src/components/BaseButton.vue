<script setup lang="ts">
defineProps<{
  type?: 'primary' | 'default';
}>();
defineEmits<{ (e: 'click'): void }>();
</script>

<template>
  <button
    class="btn"
    :class="type === 'primary' ? 'btn-primary' : 'btn-default'"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  cursor: pointer;
}
.btn-default {
  background: #f2f2f2;
  color: #222;
}
.btn-primary {
  background: #1677ff;
  color: #fff;
}
.btn:focus {
  outline: 2px solid #1677ff55;
}
</style>