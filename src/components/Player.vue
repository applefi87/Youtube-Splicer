<template>
  <div class="text-center">
    <div id="player1" class="w-full aspect-video mb-2"></div>
    <div id="player2" class="w-full aspect-video mb-2" style="display:none"></div>
    <ProgressBar class="mt-2" />
    <div class="mt-2 space-x-2">
      <button @click="prevClip" class="bg-gray-500 text-white px-2 py-1">Prev</button>
      <button @click="play" class="bg-green-500 text-white px-4 py-1">Play</button>
      <button @click="pause" class="bg-gray-500 text-white px-4 py-1">Pause</button>
      <button @click="nextClip" class="bg-gray-500 text-white px-2 py-1">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, provide } from 'vue'
import ProgressBar from './ProgressBar.vue'
import { useClips } from '../stores/clips'
import { storeToRefs } from 'pinia'

const clipStore = useClips()
const { clips, tracking, progress, current } = storeToRefs(clipStore)
const { setCurrent, reset, pauseTracking, resumeTracking, offsets, totalDuration, setProgress } = clipStore

let players = [null, null]
const playerReady = [false, false]
const activePlayer = ref(null)
const playing = ref(false)
let apiReady = false
let endChecker = null
const currentPlayer = ref(0)
let lastPrevPress = 0

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
      onReady: () => (playerReady[0] = true),
      onStateChange: handleState
    }
  })
  players[1] = new YT.Player('player2', {
    height: '360',
    width: '100%',
    videoId: '',
    playerVars: { origin: location.origin },
    events: {
      onReady: () => (playerReady[1] = true),
      onStateChange: handleState
    }
  })
}

function handleState(event) {
  if (event.data === YT.PlayerState.PAUSED) {
    pauseTracking()
    playing.value = false
  } else if (event.data === YT.PlayerState.PLAYING) {
    resumeTracking()
    playing.value = true
  }
}

function seekByProgress(sec) {
  const list = Array.isArray(clips.value) ? clips.value : []
  const offs = offsets()
  let acc = 0
  for (let i = 0; i < list.length; i++) {
    const dur = list[i].end - list[i].start
    if (sec < acc + dur) {
      if (i !== current.value) {
        playSegment(i)
      }
      const pos = list[i].start + (sec - acc)
      if (activePlayer.value) {
        activePlayer.value.seekTo(pos, true)
      }
      break
    }
    acc += dur
  }
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

function play() {
  if (!activePlayer.value) {
    startPlaylist()
  } else {
    seekByProgress(progress.value)
    activePlayer.value.playVideo()
  }
  playing.value = true
  resumeTracking()
}

function pause() {
  if (activePlayer.value && activePlayer.value.pauseVideo) {
    activePlayer.value.pauseVideo()
    pauseTracking()
    playing.value = false
  }
}

function nextClip() {
  const idx = current.value + 1
  if (idx < clips.value.length) {
    setProgress(offsets()[idx])
    playSegment(idx)
    playing.value = true
    resumeTracking()
  }
}

function prevClip() {
  const now = Date.now()
  if (now - lastPrevPress < 2000) {
    if (current.value > 0) {
      const idx = current.value - 1
      setProgress(offsets()[idx])
      playSegment(idx)
    } else {
      setProgress(0)
      playSegment(0)
    }
  } else {
    const list = Array.isArray(clips.value) ? clips.value : []
    const clip = list[current.value]
    if (clip && activePlayer.value?.seekTo) {
      activePlayer.value.seekTo(clip.start, true)
      setProgress(offsets()[current.value])
    }
  }
  playing.value = true
  resumeTracking()
  lastPrevPress = now
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
  setProgress(0)
  currentPlayer.value = 0
  playSegment(0)
  resumeTracking()
  playing.value = true
}

provide('ytPlayer', activePlayer)
provide('playSegment', playSegment)
provide('startPlaylist', startPlaylist)

onMounted(() => {
  if (clips.value.length) startPlaylist()
})

watch(clips, (n, o) => {
  if (n.length && !o.length) startPlaylist()
})
</script>
