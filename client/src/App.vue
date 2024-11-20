<template>
  <div class="min-h-screen bg-gray-100">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSocketStore } from './stores/socket'

const socketStore = useSocketStore()

onMounted(() => {
  socketStore.initializeSocket()
})
</script> 