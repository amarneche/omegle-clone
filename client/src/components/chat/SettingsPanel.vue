<template>
  <div>
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
      :class="{ 'opacity-0': !show, 'opacity-100': show }"
      @click="handleClose"
    ></div>

    <!-- Panel -->
    <div 
      class="fixed z-50 transition-transform duration-300 ease-out transform bg-gray-900 shadow-xl"
      :class="[
        'md:w-[400px] w-full h-full', 
        'md:right-0 md:top-0',
        show ? 'translate-x-0' : 'translate-x-full'
      ]"
    >
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-700/50">
        <h2 class="text-xl font-bold text-white">Settings</h2>
        <button 
          @click="handleClose"
          class="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
        >
          <X class="w-5 h-5 text-white" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex flex-col h-[calc(100%-80px)] overflow-hidden">
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
          <!-- Username Section -->
          <section class="space-y-3">
            <h3 class="text-sm font-medium text-gray-300">Username</h3>
            <div class="flex gap-2">
              <input
                v-model="localSettings.username"
                type="text"
                class="flex-1 bg-gray-800/50 text-white rounded-lg px-3 py-2 
                       focus:ring-2 focus:ring-blue-500 outline-none border border-gray-700/50
                       placeholder-gray-500"
                placeholder="Enter your name"
                @keyup.enter="updateUsername"
              />
              <button
                @click="updateUsername"
                class="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 
                       rounded-lg transition-colors border border-blue-500/30"
                :disabled="!localSettings.username.trim()"
              >
                Update
              </button>
            </div>
          </section>

          <!-- Current Mood -->
          <section class="space-y-3">
            <h3 class="text-sm font-medium text-gray-300">Current Mood</h3>
            <CurrentMood :mood="localSettings.mood" class="bg-gray-800/50 p-4 rounded-lg" />
          </section>

          <!-- Mood Selector -->
          <section class="space-y-3">
            <h3 class="text-sm font-medium text-gray-300">Change Mood</h3>
            <MoodSelector 
              :current-mood="localSettings.mood"
              @mood-selected="updateMood"
              class="bg-gray-800/50 rounded-lg p-4" 
            />
          </section>

          <!-- Language Preferences -->
          <section class="space-y-3">
            <h3 class="text-sm font-medium text-gray-300">Language Preferences</h3>
            <select
              v-model="localSettings.preferences.language"
              class="w-full bg-gray-800/50 text-white rounded-lg px-3 py-2 
                     focus:ring-2 focus:ring-blue-500 outline-none border border-gray-700/50"
              @change="updatePreferences"
            >
              <option value="any">Any Language</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </section>
        </div>

        <!-- Footer with Apply Button -->
        <div class="p-6 border-t border-gray-700/50 bg-gray-900/90 backdrop-blur-sm">
          <button
            @click="applyAllChanges"
            class="w-full px-4 py-3 bg-green-500/20 hover:bg-green-500/30 
                   text-green-300 rounded-lg transition-colors border border-green-500/30
                   disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!hasChanges"
          >
            <span class="flex items-center justify-center gap-2">
              <Save v-if="hasChanges" class="w-5 h-5" />
              Apply Changes
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { X, Save } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings'
import { useSocketStore } from '@/stores/socket'
import MoodSelector from '../MoodSelector.vue'
import CurrentMood from './CurrentMood.vue'
import { generateRandomUsername } from '@/utils/username'

const settingsStore = useSettingsStore()
const socketStore = useSocketStore()

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  initialSettings: {
    type: Object,
    default: () => ({
      username: '',
      mood: {
        type: 'casual',
        tags: [],
        subject: '',
      },
      preferences: {
        language: 'any',
        skillLevel: 'any',
      }
    })
  }
})

const emit = defineEmits({
  close: null,
  update: (settings) => {
    // Validate settings object
    return settings && 
           typeof settings === 'object' && 
           'username' in settings &&
           'mood' in settings &&
           'preferences' in settings
  }
})

// Local state for tracking changes
const localSettings = ref({
  username: '',
  mood: {
    type: 'casual',
    tags: [],
    subject: '',
  },
  preferences: {
    language: 'any',
    skillLevel: 'any',
  }
})



// Watch for prop changes
watch(() => props.initialSettings, (newSettings) => {
  localSettings.value = {
    username: newSettings.username || generateRandomUsername(),
    mood: { ...newSettings.mood },
    preferences: { ...newSettings.preferences }
  }
}, { immediate: true, deep: true })

// Computed property to check if there are unsaved changes
const hasChanges = computed(() => {
  return JSON.stringify(localSettings.value) !== JSON.stringify({
    username: settingsStore.username,
    mood: settingsStore.mood,
    preferences: settingsStore.preferences
  })
})

// Methods for updating individual settings
const updateUsername = () => {
  if (localSettings.value.username.trim()) {
    settingsStore.setUsername(localSettings.value.username.trim())
  }
}

const updateMood = (newMood) => {
  localSettings.value.mood = newMood
  settingsStore.setMood(newMood.type, newMood.tags, newMood.subject)
}

const updatePreferences = () => {
  settingsStore.setPreferences(localSettings.value.preferences)
}

// Method to apply all changes at once
const applyAllChanges = () => {
  emit('update', {
    username: localSettings.value.username,
    mood: localSettings.value.mood,
    preferences: localSettings.value.preferences
  })
  emit('close')
}

// Handle panel close
const handleClose = () => {
  if (hasChanges.value) {
    if (confirm('You have unsaved changes. Do you want to save them before closing?')) {
      applyAllChanges()
    } else {
      // Reset local settings to initial values
      localSettings.value = {
        username: props.initialSettings.username,
        mood: { ...props.initialSettings.mood },
        preferences: { ...props.initialSettings.preferences }
      }
    }
  }
  emit('close')
}

// Watch for external changes to settings
watch(() => settingsStore.$state, (newSettings) => {
  localSettings.value = {
    username: newSettings.username,
    mood: { ...newSettings.mood },
    preferences: { ...newSettings.preferences }
  }
}, { deep: true })
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Prevent body scroll when panel is open */
:deep(body.panel-open) {
  overflow: hidden;
}
</style> 