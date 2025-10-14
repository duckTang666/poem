<script setup lang="ts">
import { useCounterStore } from '../stores/counter';
const counter = useCounterStore();
</script>

<template>
  <section>
    <button @click="counter.increment()">+1</button>
  </section>
</template>