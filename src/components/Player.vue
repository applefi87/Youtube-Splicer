<template>
  <div>
    <div v-if="clips.length">
      <div
        id="player1"
        class="w-full aspect-video mb-2"
        v-show="currentPlayer === 0"
      ></div>
      <div
        id="player2"
        class="w-full aspect-video mb-2"
        v-show="currentPlayer === 1"
      ></div>
    </div>
    <div
      v-else
      class="w-full aspect-video mb-2 flex items-center justify-center bg-gray-200"
    >
      <span class="text-gray-500">Add a clip to begin</span>
    </div>
    <div v-if="clips.length" class="mb-2">
      <button
        @click="togglePlay"
        class="px-3 py-1 bg-green-500 text-white rounded"
      >
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
    </div>
    <ProgressBar v-if="clips.length" />
  </div>
</template>

<script setup>
import {
  onMounted,
  ref,
  watch,
  provide,
  computed,
  onBeforeUnmount,
} from 'vue'
import ProgressBar from './ProgressBar.vue';
import { useClips } from '../stores/clips'

const { clips, current } = useClips()
const players = [ref(null), ref(null)]
const currentPlayer = ref(0)
const isPlaying = ref(false)
let endChecker = null

const ytPlayer = computed(() => players[currentPlayer.value].value)
provide('ytPlayer', ytPlayer)

function loadScript() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }
    window.onYouTubeIframeAPIReady = () => resolve()
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)
  })
}

function initPlayers() {
  return new Promise((resolve) => {
    let ready = 0
    const done = () => {
      ready += 1
      if (ready === 2) resolve()
    }
    const opts = {
      height: '360',
      width: '640',
      playerVars: { origin: location.origin },
      events: { onReady: done },
    }
    players[0].value = new window.YT.Player('player1', opts)
    players[1].value = new window.YT.Player('player2', opts)
  })
}

function playSegment(idx) {
  if (!Array.isArray(clips.value) || idx >= clips.value.length) return
  const seg = clips.value[idx]
  const now = currentPlayer.value
  const next = 1 - now
  const nowPlayer = players[now].value
  const nextPlayer = players[next].value

  current.value = idx

  // display
  currentPlayer.value = now

  if (nowPlayer && nowPlayer.loadVideoById) {
    nowPlayer.loadVideoById({
      videoId: seg.id,
      startSeconds: seg.start,
      endSeconds: seg.end,
    })
  }

  if (clips.value[idx + 1]) {
    const nxt = clips.value[idx + 1]
    if (nextPlayer && nextPlayer.cueVideoById) {
      nextPlayer.cueVideoById({
        videoId: nxt.id,
        startSeconds: nxt.start,
        endSeconds: nxt.end,
      })
    }
  }

  clearInterval(endChecker)
  endChecker = setInterval(() => {
    if (nowPlayer && nowPlayer.getCurrentTime) {
      const t = nowPlayer.getCurrentTime()
      if (t >= seg.end - 0.05) {
        clearInterval(endChecker)
        currentPlayer.value = next
        playSegment(idx + 1)
      }
    }
  }, 100)

  if (isPlaying.value) {
    nowPlayer.playVideo()
  }
}

function togglePlay() {
  const p = players[currentPlayer.value].value
  if (!p) return
  if (isPlaying.value) {
    p.pauseVideo()
    isPlaying.value = false
  } else {
    p.playVideo()
    isPlaying.value = true
  }
}

watch(
  () => clips.value.length,
  async (len, oldLen) => {
    if (len && !players[0].value) {
      await loadScript()
      await initPlayers()
      playSegment(0)
    } else if (!oldLen && len) {
      playSegment(0)
    }
  }
)

onMounted(async () => {
  if (Array.isArray(clips.value) && clips.value.length) {
    await loadScript()
    await initPlayers()
    playSegment(0)
  }
})

onBeforeUnmount(() => {
  clearInterval(endChecker)
})
</script>
