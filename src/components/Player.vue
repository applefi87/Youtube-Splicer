<template>
  <div class="text-center">
    <div id="player" class="w-full aspect-video mb-4"></div>
    <div class="flex space-x-2 justify-center">
      <input
        v-model="url"
        type="text"
        placeholder="https://youtu.be/VIDEO_ID"
        class="flex-1 border p-2"
      />
      <button @click="handleLoad" class="bg-blue-500 text-white px-4 py-2">加载视频</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const url = ref('')
let player = null

function extractVideoID(link) {
  const reg = /(?:v=|\/)([0-9A-Za-z_-]{11})/
  const m = link.match(reg)
  return m ? m[1] : null
}

function loadScript() {
  return new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }
    window.onYouTubeIframeAPIReady = () => resolve()
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.onerror = () => reject(new Error('Unable to load YouTube API'))
    document.head.appendChild(tag)
  })
}

async function createPlayer() {
  await loadScript()
  player = new window.YT.Player('player', {
    height: '360',
    width: '100%',
    videoId: '',
    playerVars: { autoplay: 0, controls: 1 },
  })
}

function handleLoad() {
  const id = extractVideoID(url.value.trim())
  if (!id) {
    alert('请输入有效的 YouTube 视频链接！')
    return
  }
  if (player && player.loadVideoById) {
    player.loadVideoById(id)
  } else {
    alert('播放器尚未初始化，请稍候再试。')
  }
}

onMounted(() => {
  createPlayer().catch(console.error)
})
</script>
