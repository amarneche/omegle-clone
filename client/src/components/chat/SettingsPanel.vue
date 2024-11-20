<template>
  <div 
    class="absolute inset-0 bg-gray-800/95 backdrop-blur-sm rounded-xl flex flex-col z-20
           transform transition-transform duration-300"
  >
    <div class="flex justify-between items-center p-6">
      <h2 class="text-xl font-bold text-white">Settings</h2>
      <button 
        @click="$emit('close')"
        class="p-2 hover:bg-gray-700 rounded-full transition-colors"
      >
        <X class="w-5 h-5 text-white" />
      </button>
    </div>
    <div class="flex-1 overflow-y-auto px-6 pb-6">
        <CurrentMood :mood="mood" />
        <MoodSelector />
    </div>
  </div>
</template>

<script setup>
import { X } from 'lucide-vue-next'
import MoodSelector from '../MoodSelector.vue'
import CurrentMood from './CurrentMood.vue'

defineProps({
  mood: Object
})

defineEmits(['close'])
</script> 