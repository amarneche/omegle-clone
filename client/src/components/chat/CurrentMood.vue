<template>
  <div class="mb-6">
    <h3 class="text-sm font-medium text-gray-400 mb-2">Current Mood</h3>
    <div class="flex items-center gap-2 p-3 bg-gray-700/50 rounded-lg">
      <div class="p-2 rounded-lg" :class="getMoodColor(mood.type)">
        <span class="text-xl">{{ getMoodEmoji(mood.type) }}</span>
      </div>
      <div>
        <p class="text-white font-medium">{{ getMoodName(mood.type) }}</p>
        <p class="text-sm text-gray-400">{{ mood.tags.join(', ') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { moodUtils } from '@/utils/mood'

const props = defineProps({
  mood: {
    type: Object,
    required: true
  }
})

const { getMoodColor, getMoodEmoji, getMoodName } = moodUtils
</script> 