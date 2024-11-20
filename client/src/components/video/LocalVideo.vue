<template>
  <div class="absolute bottom-4 right-4 w-32 h-48 bg-gray-900 rounded-lg overflow-hidden shadow-lg">
    <video
      ref="videoRef"
      class="w-full h-full object-cover mirror"
      autoplay
      playsinline
      muted
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  stream: {
    type: MediaStream,
    default: null
  }
})

const videoRef = ref(null)

watch(() => props.stream, (newStream) => {
  if (videoRef.value && newStream) {
    console.log('Setting local video stream')
    videoRef.value.srcObject = newStream
  }
}, { immediate: true })

onMounted(() => {
  if (videoRef.value && props.stream) {
    console.log('Setting initial local video stream')
    videoRef.value.srcObject = props.stream
  }
})
</script>

<style scoped>
.mirror {
  transform: scaleX(-1);
}
</style> 