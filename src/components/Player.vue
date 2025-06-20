<template>
  <div>
    <div v-if="clips.length" id="player" class="w-full aspect-video mb-2"></div>
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
import { onMounted, ref, watch, provide } from 'vue'
import ProgressBar from './ProgressBar.vue';
import { useClips } from '../stores/clips';

const { clips, current, next } = useClips()
const player = ref(null);
const ready = ref(false);
const isPlaying = ref(false);
provide('ytPlayer', player);

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

function initPlayer() {
  const firstId = Array.isArray(clips.value) && clips.value.length
    ? clips.value[0].id
    : ''
  player.value = new window.YT.Player('player', {
    height: '360',
    width: '640',
    videoId: firstId,
    playerVars: { controls: 0 },
    events: {
      onReady,
      onStateChange,
    },
  })
}

function onReady() {
  ready.value = true
  if (clips.value.length) {
    playClip(0)
  }
}

function playClip(index) {
  const clip = clips.value[index]
  if (!clip || !player.value) return
  player.value.cueVideoById({
    videoId: clip.id,
    startSeconds: clip.start,
    endSeconds: clip.end,
  })
  current.value = index
  if (isPlaying.value) {
    player.value.playVideo()
  }
}

function onStateChange(e) {
  if (e.data === window.YT.PlayerState.ENDED) {
    const nextIndex = current.value + 1;
    if (nextIndex < clips.value.length) {
      playClip(nextIndex);
    }
  }
}

function togglePlay() {
  if (!player.value) return;
  if (isPlaying.value) {
    player.value.pauseVideo();
    isPlaying.value = false;
  } else {
    player.value.playVideo();
    isPlaying.value = true;
  }
}

watch(clips, async (newClips, oldClips) => {
  if (Array.isArray(newClips) && newClips.length && !player.value) {
    await loadScript()
    initPlayer()
  } else if (
    ready.value &&
    Array.isArray(oldClips) &&
    !oldClips.length &&
    Array.isArray(newClips) &&
    newClips.length
  ) {
    playClip(0)
  }
})

onMounted(async () => {
  if (Array.isArray(clips.value) && clips.value.length) {
    await loadScript()
    initPlayer()
  }
})
</script>
