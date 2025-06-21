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

let players = [null, null]
const playerReady = [false, false]
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
  players[0] = new YT.Player('player1', {
    height: '360',
    width: '100%',
    videoId: '',
    playerVars: { origin: location.origin },
    events: {
      onReady: () => (playerReady[0] = true)
    }
  })
  players[1] = new YT.Player('player2', {
    height: '360',
    width: '100%',
    videoId: '',
    playerVars: { origin: location.origin },
    events: {
      onReady: () => (playerReady[1] = true)
    }
  })
}

async function init() {
  if (!apiReady) {
    await loadAPI()
    apiReady = true
  }
  if (!players[0] || !players[1]) {
    createPlayers()
  }
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

  const curr = players[now]
  if (curr && typeof curr.loadVideoById === 'function') {
    curr.loadVideoById({
      videoId: seg.id,
      startSeconds: seg.start,
      endSeconds: seg.end
    })
  } else {
    console.error('Player not ready', curr)
    return
  }

  if (list[idx + 1]) {
    const nxt = list[idx + 1]
    const nxtPlayer = players[next]
    if (nxtPlayer && typeof nxtPlayer.cueVideoById === 'function') {
      nxtPlayer.cueVideoById({
        videoId: nxt.id,
        startSeconds: nxt.start,
        endSeconds: nxt.end
      })
    }
  }

  activePlayer.value = curr

  clearInterval(endChecker)
  endChecker = setInterval(() => {
    if (!curr.getCurrentTime) return
    const t = curr.getCurrentTime()
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
  await new Promise(r => {
    const check = setInterval(() => {
      if (playerReady[0] && playerReady[1]) {
        clearInterval(check)
        r()
      }
    }, 50)
  })
  reset()
  currentPlayer.value = 0
  playSegment(0)
}

provide('ytPlayer', activePlayer)
provide('playSegment', playSegment)

onMounted(() => {
  if (clips.value.length) startPlaylist()
})

watch(clips, (n, o) => {
  if (n.length && !o.length) startPlaylist()
})
</script>
