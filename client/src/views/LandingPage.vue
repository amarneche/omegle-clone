<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
    <!-- Navigation -->
    <nav class="absolute top-0 left-0 right-0 p-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-blue-500 rounded-lg">
            <Video class="w-6 h-6 text-white" />
          </div>
          <span class="text-white font-bold text-xl">RandomChat</span>
        </div>
        <div class="flex items-center gap-2 text-green-400">
          <Users class="w-5 h-5" />
          <span>{{ onlineUsers }} online now</span>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <!-- Left Side - Hero Content -->
        <div class="text-center md:text-left space-y-6">
          <h1 class="text-4xl md:text-6xl font-bold text-white leading-tight">
            Meet New People <br/>
            <span class="text-blue-500">Around the World</span>
          </h1>
          <p class="text-gray-400 text-lg md:text-xl max-w-lg">
            Connect instantly with people worldwide through video chat. No registration required, just click and start chatting!
          </p>
          <div class="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
            <button
              @click="startChat"
              class="bg-blue-500 hover:bg-blue-600 text-white py-4 px-8 rounded-xl
                     flex items-center justify-center gap-2 transition-all duration-300
                     transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              <UserPlus class="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Start Chatting Now
            </button>
            <button
              @click="scrollToFeatures"
              class="bg-gray-700 hover:bg-gray-600 text-white py-4 px-8 rounded-xl
                     flex items-center justify-center gap-2 transition-all duration-300"
            >
              <Info class="w-5 h-5" />
              Learn More
            </button>
          </div>
        </div>

        <!-- Right Side - Join Form -->
        <div class="bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-white mb-2">Get Started</h2>
            <p class="text-gray-400">Join {{ onlineUsers }} people chatting right now</p>
          </div>

          <!-- Name Input -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">Choose Your Display Name</label>
            <div class="relative">
              <input 
                v-model="username"
                type="text"
                class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white 
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name (optional)"
              >
              <User class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-700/30 p-4 rounded-lg text-center">
              <h3 class="text-2xl font-bold text-blue-400">100%</h3>
              <p class="text-gray-400 text-sm">Free to Use</p>
            </div>
            <div class="bg-gray-700/30 p-4 rounded-lg text-center">
              <h3 class="text-2xl font-bold text-green-400">0s</h3>
              <p class="text-gray-400 text-sm">Setup Time</p>
            </div>
          </div>

          <!-- Features List -->
          <div class="space-y-3 mb-6">
            <div class="flex items-center gap-3 text-gray-300">
              <div class="p-1 bg-green-500/10 rounded-full">
                <Check class="w-4 h-4 text-green-500" />
              </div>
              <span>No registration required</span>
            </div>
            <div class="flex items-center gap-3 text-gray-300">
              <div class="p-1 bg-green-500/10 rounded-full">
                <Check class="w-4 h-4 text-green-500" />
              </div>
              <span>HD video quality</span>
            </div>
            <div class="flex items-center gap-3 text-gray-300">
              <div class="p-1 bg-green-500/10 rounded-full">
                <Check class="w-4 h-4 text-green-500" />
              </div>
              <span>Safe and secure</span>
            </div>
          </div>

          <!-- Start Button -->
          <button
            @click="startChat"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-lg
                   flex items-center justify-center gap-2 transition-all duration-300
                   transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Video class="w-5 h-5" />
            Start Video Chat
          </button>

          <p class="text-center text-gray-400 text-sm mt-4">
            By starting, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>

    <!-- Use Cases Section -->
    <div class="py-20 px-4 bg-gray-900/30">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          What Can You Do? 🤔
        </h2>
        <p class="text-gray-400 text-center mb-12 text-lg">
          Connect with people who share your interests and goals!
        </p>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Language Exchange -->
          <div class="bg-gray-800/50 p-6 rounded-xl transform hover:scale-105 transition-all duration-300">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-4xl">🗣️</span>
              <h3 class="text-xl font-bold text-white">Language Exchange</h3>
            </div>
            <p class="text-gray-400">
              Practice speaking with native speakers. Improve your pronunciation and fluency in a fun way!
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">English</span>
              <span class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Spanish</span>
              <span class="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">French</span>
            </div>
          </div>

          <!-- Study Together -->
          <div class="bg-gray-800/50 p-6 rounded-xl transform hover:scale-105 transition-all duration-300">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-4xl">📚</span>
              <h3 class="text-xl font-bold text-white">Study Buddies</h3>
            </div>
            <p class="text-gray-400">
              Find study partners, share knowledge, and motivate each other. Make learning more engaging!
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">Math</span>
              <span class="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm">Science</span>
              <span class="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">History</span>
            </div>
          </div>

          <!-- Cultural Exchange -->
          <div class="bg-gray-800/50 p-6 rounded-xl transform hover:scale-105 transition-all duration-300">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-4xl">🌍</span>
              <h3 class="text-xl font-bold text-white">Cultural Exchange</h3>
            </div>
            <p class="text-gray-400">
              Share traditions, customs, and stories. Experience the world from your home!
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">Traditions</span>
              <span class="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-sm">Food</span>
              <span class="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm">Arts</span>
            </div>
          </div>

          <!-- Skill Sharing -->
          <div class="bg-gray-800/50 p-6 rounded-xl transform hover:scale-105 transition-all duration-300">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-4xl">🎯</span>
              <h3 class="text-xl font-bold text-white">Skill Sharing</h3>
            </div>
            <p class="text-gray-400">
              Teach what you know, learn what you don't. Exchange skills and grow together!
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">Music</span>
              <span class="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-sm">Art</span>
              <span class="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">Tech</span>
            </div>
          </div>

          <!-- Practice Interviews -->
          <div class="bg-gray-800/50 p-6 rounded-xl transform hover:scale-105 transition-all duration-300">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-4xl">👔</span>
              <h3 class="text-xl font-bold text-white">Mock Interviews</h3>
            </div>
            <p class="text-gray-400">
              Practice job interviews, build confidence, and get feedback in a safe environment!
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-sm">Tech</span>
              <span class="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">Business</span>
              <span class="px-3 py-1 bg-lime-500/20 text-lime-400 rounded-full text-sm">Academic</span>
            </div>
          </div>

          <!-- Make Friends -->
          <div class="bg-gray-800/50 p-6 rounded-xl transform hover:scale-105 transition-all duration-300">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-4xl">🤝</span>
              <h3 class="text-xl font-bold text-white">Make Friends</h3>
            </div>
            <p class="text-gray-400">
              Connect with like-minded people, share interests, and build lasting friendships!
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-fuchsia-500/20 text-fuchsia-400 rounded-full text-sm">Hobbies</span>
              <span class="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-full text-sm">Games</span>
              <span class="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">Travel</span>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="mt-12 text-center">
          <button
            @click="startChat"
            class="bg-blue-500 hover:bg-blue-600 text-white py-4 px-8 rounded-xl
                   inline-flex items-center gap-2 transition-all duration-300
                   transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span class="text-2xl">🚀</span>
            Start Your Journey Now
          </button>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div ref="featuresSection" class="py-20 px-4 bg-gray-800/50">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Why Choose RandomChat?
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-gray-800/50 p-6 rounded-xl">
            <div class="p-3 bg-blue-500/10 rounded-xl w-fit mb-4">
              <Zap class="w-6 h-6 text-blue-500" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Instant Connection</h3>
            <p class="text-gray-400">Connect with new people instantly. No waiting, no registration needed.</p>
          </div>

          <!-- Feature 2 -->
          <div class="bg-gray-800/50 p-6 rounded-xl">
            <div class="p-3 bg-green-500/10 rounded-xl w-fit mb-4">
              <Shield class="w-6 h-6 text-green-500" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Safe & Private</h3>
            <p class="text-gray-400">Your privacy is our priority. All connections are secure and anonymous.</p>
          </div>

          <!-- Feature 3 -->
          <div class="bg-gray-800/50 p-6 rounded-xl">
            <div class="p-3 bg-purple-500/10 rounded-xl w-fit mb-4">
              <Globe class="w-6 h-6 text-purple-500" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Global Community</h3>
            <p class="text-gray-400">Meet people from different cultures and backgrounds worldwide.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Video, 
  UserPlus, 
  Users, 
  User,
  Info,
  Check,
  Shield,
  Globe,
  Zap
} from 'lucide-vue-next'
import { useSocketStore } from '../stores/socket'

const router = useRouter()
const socketStore = useSocketStore()
const username = ref('')
const onlineUsers = ref(0)
const featuresSection = ref(null)

onMounted(() => {
  socketStore.socket.on('online-users', (count) => {
    onlineUsers.value = count
  })
})

const startChat = () => {
  socketStore.setUsername(username.value || generateRandomName())
  router.push('/chat')
}

const scrollToFeatures = () => {
  featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
}

const generateRandomName = () => {
  const adjectives = ['Happy', 'Lucky', 'Sunny', 'Clever', 'Swift', 'Kind', 'Brave']
  const nouns = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox', 'Wolf', 'Bear']
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${randomAdjective}${randomNoun}`
}
</script>

<style scoped>
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

button:hover {
  animation: pulse 2s infinite;
}
</style> 