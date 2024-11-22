<template>
  <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700/50 w-[320px]">
    <!-- Categories -->
    <div class="border-b border-gray-700/50 p-2 flex gap-2 overflow-x-auto custom-scrollbar">
      <button
        v-for="category in categories"
        :key="category.name"
        @click="currentCategory = category.name"
        class="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
        :class="{ 'bg-gray-700/50': currentCategory === category.name }"
        :title="category.name"
      >
        {{ category.icon }}
      </button>
    </div>

    <!-- Search -->
    <div class="p-2 border-b border-gray-700/50">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search emojis..."
        class="w-full bg-gray-700/50 text-white rounded-lg px-3 py-2
               focus:ring-2 focus:ring-blue-500 outline-none border border-gray-700/50
               placeholder-gray-500 text-sm"
      />
    </div>

    <!-- Emojis Grid -->
    <div class="p-2 h-[240px] overflow-y-auto custom-scrollbar">
      <div class="grid grid-cols-8 gap-1">
        <button
          v-for="emoji in filteredEmojis"
          :key="emoji.emoji"
          @click="selectEmoji(emoji.emoji)"
          class="p-2 text-xl hover:bg-gray-700/50 rounded-lg transition-colors"
          :title="emoji.description"
        >
          {{ emoji.emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['select'])
const currentCategory = ref('smileys')
const searchQuery = ref('')

const categories = [
  { name: 'smileys', icon: '😊' },
  { name: 'people', icon: '👋' },
  { name: 'animals', icon: '🐶' },
  { name: 'food', icon: '🍔' },
  { name: 'activities', icon: '⚽' },
  { name: 'travel', icon: '✈️' },
  { name: 'objects', icon: '💡' },
  { name: 'symbols', icon: '❤️' }
]

const emojis = {
  smileys: [
    { emoji: '😊', description: 'Smiling face with smiling eyes' },
    { emoji: '😂', description: 'Face with tears of joy' },
    { emoji: '🥰', description: 'Smiling face with hearts' },
    { emoji: '😎', description: 'Smiling face with sunglasses' },
    { emoji: '🤔', description: 'Thinking face' },
    { emoji: '😅', description: 'Grinning face with sweat' },
    { emoji: '😇', description: 'Smiling face with halo' },
    { emoji: '🙃', description: 'Upside-down face' },
    { emoji: '😉', description: 'Winking face' },
    { emoji: '🤗', description: 'Hugging face' },
    { emoji: '🤭', description: 'Face with hand over mouth' },
    { emoji: '😌', description: 'Relieved face' },
    { emoji: '😍', description: 'Smiling face with heart-eyes' },
    { emoji: '🥳', description: 'Partying face' },
    { emoji: '😴', description: 'Sleeping face' },
    { emoji: '🤯', description: 'Exploding head' }
  ],
  people: [
    { emoji: '👋', description: 'Waving hand' },
    { emoji: '🤝', description: 'Handshake' },
    { emoji: '👍', description: 'Thumbs up' },
    { emoji: '👏', description: 'Clapping hands' },
    { emoji: '🙌', description: 'Raising hands' },
    { emoji: '🤟', description: 'Love-you gesture' },
    { emoji: '🤘', description: 'Sign of the horns' },
    { emoji: '✌️', description: 'Victory hand' },
    { emoji: '🫂', description: 'People hugging' },
    { emoji: '💪', description: 'Flexed biceps' },
    { emoji: '🧠', description: 'Brain' },
    { emoji: '👀', description: 'Eyes' }
  ],
  // Add more categories as needed...
}

const filteredEmojis = computed(() => {
  const categoryEmojis = emojis[currentCategory.value] || []
  if (!searchQuery.value) return categoryEmojis

  const query = searchQuery.value.toLowerCase()
  return categoryEmojis.filter(emoji => 
    emoji.description.toLowerCase().includes(query)
  )
})

const selectEmoji = (emoji) => {
  emit('select', emoji)
}
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style> 