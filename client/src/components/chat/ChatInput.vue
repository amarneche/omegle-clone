<template>
  <div class="border-t border-gray-700/50 p-4 mt-4">
    <form @submit.prevent="handleSubmit" class="flex gap-2">
      <div class="relative flex-1">
        <input
          v-model="message"
          type="text"
          placeholder="Type a message..."
          :disabled="disabled"
          class="w-full bg-gray-800/50 text-white rounded-lg pl-4 pr-10 py-2.5
                 focus:ring-2 focus:ring-blue-500 outline-none border border-gray-700/50
                 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          @keydown.enter.prevent="handleSubmit"
        />
        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            type="button"
            @click="toggleEmoji"
            class="p-1.5 hover:bg-gray-700/50 rounded-full transition-colors text-gray-400 hover:text-gray-300"
          >
            <Smile class="w-5 h-5" />
          </button>
        </div>
      </div>
      <button
        type="submit"
        :disabled="!message.trim() || disabled"
        class="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 
               rounded-lg transition-colors border border-blue-500/30
               disabled:opacity-50 disabled:cursor-not-allowed
               flex items-center gap-2"
      >
        <Send class="w-5 h-5" />
        <span class="hidden sm:inline">Send</span>
      </button>
    </form>

    <!-- Emoji Picker -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div 
        v-if="showEmoji"
        class="absolute bottom-full right-0 mb-2"
        v-click-outside="closeEmojiPicker"
      >
        <EmojiPicker @select="addEmoji" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Send, Smile } from 'lucide-vue-next'
import EmojiPicker from './EmojiPicker.vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send'])

const message = ref('')
const showEmoji = ref(false)

const handleSubmit = () => {
  if (message.value.trim() && !props.disabled) {
    emit('send', message.value)
    message.value = ''
  }
}

const toggleEmoji = () => {
  showEmoji.value = !showEmoji.value
}

const closeEmojiPicker = () => {
  showEmoji.value = false
}

const addEmoji = (emoji) => {
  const input = document.activeElement
  const startPos = input?.selectionStart || message.value.length
  const endPos = input?.selectionEnd || message.value.length
  
  message.value = 
    message.value.substring(0, startPos) + 
    emoji + 
    message.value.substring(endPos)
    
  // Set cursor position after emoji
  nextTick(() => {
    if (input) {
      const newPos = startPos + emoji.length
      input.setSelectionRange(newPos, newPos)
      input.focus()
    }
  })
}
</script>

<style scoped>
.emoji-picker-enter-active,
.emoji-picker-leave-active {
  transition: all 0.2s ease;
}

.emoji-picker-enter-from,
.emoji-picker-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style> 