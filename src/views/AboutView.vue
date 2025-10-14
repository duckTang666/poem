<script setup lang="ts">
import { useCounterStore } from '../stores/counter';
const counter = useCounterStore();
</script>

<template>
  <section>
    <h2>About</h2>
    <p>Pinia 计数器：{{ counter.count }}</p>
    <button @click="counter.increment()">+1</button>
  </section>
</template>