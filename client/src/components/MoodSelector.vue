<template>
  <div class="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 class="text-xl font-bold text-white mb-4">What's Your Mood Today? 🎯</h3>
    
    <div class="h-64 overflow-y-scroll px-2 scrollbar-hide">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          v-for="(config, type) in MOOD_CONFIG"
          :key="type"
          @click="selectMood(type)"
          :class="getMoodClass(type)"
        >
          <span class="text-2xl">{{ config.emoji }}</span>
          <span class="text-white font-medium">{{ config.name }}</span>
        </button>
      </div>
    </div>

    <!-- Additional Settings based on selected mood -->
    <div v-if="mood.type !== MOOD_TYPES.CASUAL" class="mt-6 space-y-4">
      <!-- Language Preference -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Preferred Language</label>
        <select
          v-model="selectedLanguage"
          class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white 
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="any">Any Language</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="zh">Chinese</option>
          <option value="ja">Japanese</option>
        </select>
      </div>

      <!-- Skill Level -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Skill Level</label>
        <select
          v-model="skillLevel"
          class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white 
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="any">Any Level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { MOOD_TYPES, MOOD_CONFIG, moodUtils } from '@/utils/mood'

const settingsStore = useSettingsStore()

const selectedLanguage = ref(settingsStore.preferences.language)
const skillLevel = ref(settingsStore.preferences.skillLevel)
const mood = computed(() => settingsStore.mood)

const selectMood = (type) => {
  settingsStore.setMood(type)
}

watch([selectedLanguage, skillLevel], ([newLang, newLevel]) => {
  settingsStore.setPreferences({
    language: newLang,
    skillLevel: newLevel
  })
})

// Use the utilities in your component
const getMoodClass = (type) => {
  return [
    'p-4 rounded-xl flex flex-col items-center gap-2 transition-all duration-300',
    mood.type === type ? moodUtils.getMoodColor(type) : 'bg-gray-700/50 hover:bg-gray-700'
  ]
}
</script> 

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
