<template>
  <div class="text-center">
    <div id="player1" class="w-full aspect-video mb-2"></div>
    <div id="player2" class="w-full aspect-video mb-2" style="display:none"></div>
    <ProgressBar class="mt-2" />
    <button @click="startPlaylist" class="bg-green-500 text-white px-4 py-1 mt-2">Play</button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, provide } from 'vue'
import ProgressBar from './ProgressBar.vue'
import { useClips } from '../stores/clips'
import { storeToRefs } from 'pinia'

const clipStore = useClips()
const { clips } = storeToRefs(clipStore)
const { setCurrent, reset } = clipStore

const players = [ref(null), ref(null)]
const activePlayer = ref(null)
let apiReady = false
let endChecker = null
const currentPlayer = ref(0)

function loadAPI() {
  return new Promise(resolve => {
    if (window.YT && window.YT.Player) return resolve()
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
    window.onYouTubeIframeAPIReady = () => resolve()
  })
}

function createPlayers() {
  players[0].value = new YT.Player('player1', { height: '360', width: '100%', videoId: '' })
  players[1].value = new YT.Player('player2', { height: '360', width: '100%', videoId: '' })
}

async function init() {
  if (apiReady) return
  await loadAPI()
  apiReady = true
  createPlayers()
}

function playSegment(idx) {
  const list = Array.isArray(clips.value) ? clips.value : []
  if (idx >= list.length) return
  setCurrent(idx)
  const seg = list[idx]
  const now = currentPlayer.value
  const next = 1 - now

  document.getElementById('player' + (now + 1)).style.display = 'block'
  document.getElementById('player' + (next + 1)).style.display = 'none'

  players[now].value.loadVideoById({
    videoId: seg.id,
    startSeconds: seg.start,
    endSeconds: seg.end
  })

  if (list[idx + 1]) {
    const nxt = list[idx + 1]
    players[next].value.cueVideoById({
      videoId: nxt.id,
      startSeconds: nxt.start,
      endSeconds: nxt.end
    })
  }

  activePlayer.value = players[now].value

  clearInterval(endChecker)
  endChecker = setInterval(() => {
    const t = players[now].value.getCurrentTime()
    if (t >= seg.end - 0.05) {
      clearInterval(endChecker)
      currentPlayer.value = next
      playSegment(idx + 1)
    }
  }, 100)
}

async function startPlaylist() {
  if (!clips.value.length) return
  clearInterval(endChecker)
  await init()
  reset()
  currentPlayer.value = 0
  playSegment(0)
}

provide('ytPlayer', activePlayer)

onMounted(() => {
  if (clips.value.length) startPlaylist()
})

watch(clips, (n, o) => {
  if (n.length && !o.length) startPlaylist()
})
</script>
