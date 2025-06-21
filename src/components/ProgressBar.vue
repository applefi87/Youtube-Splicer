<template>
  <div class="h-2 bg-gray-300 relative" ref="bar" @click="seek($event)">
    <div class="h-full bg-red-600" :style="{ width: percent + '%' }"></div>
    <div
      v-for="(off, idx) in offsets().slice(1)"
      :key="idx"
      class="absolute top-0 bottom-0 w-0.5 bg-gray-700 opacity-80"
      :style="{ left: (off / totalDuration() * 100) + '%' }"
    ></div>
    <div
      class="absolute -top-1.5 w-3 h-3 rounded-full bg-white border border-gray-700 cursor-pointer"
      :style="{ left: `calc(${percent}% - 0.375rem)` }"
      @mousedown.prevent="dragStart"
    ></div>
    <div
      v-if="preview.show"
      class="absolute -top-24 -translate-x-1/2"
      :style="{ left: preview.left }"
    >
      <img :src="preview.img" class="w-32 h-18 object-cover border" />
      <div class="text-xs bg-black text-white text-center">{{ preview.time }}</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, inject, onBeforeUnmount, watch } from 'vue';
import { useClips } from '../stores/clips';
import { storeToRefs } from 'pinia';

const clipStore = useClips();
const { clips, current, progress, tracking } = storeToRefs(clipStore);
const { offsets, totalDuration, setProgress, pauseTracking, resumeTracking } = clipStore;
const percent = ref(0);
const player = inject('ytPlayer');
const playSegment = inject('playSegment');
const bar = ref(null);
const preview = ref({ show: false, left: '0%', img: '', time: '' });
let dragging = false;
let timer = null;
watch(progress, val => {
  percent.value = (val / totalDuration()) * 100;
});

onMounted(() => {
  timer = setInterval(() => {
    if (!tracking.value) return
    const list = Array.isArray(clips.value) ? clips.value : []
    const clip = list[current.value]
    if (player?.value && clip && player.value.getCurrentTime) {
      const t = player.value.getCurrentTime()
      const elapsed = offsets()[current.value] + (t - clip.start)
      setProgress(elapsed)
    }
  }, 500)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function updatePreview(clientX) {
  if (!bar.value) return
  const rect = bar.value.getBoundingClientRect()
  let ratio = (clientX - rect.left) / rect.width
  ratio = Math.max(0, Math.min(1, ratio))
  const total = totalDuration()
  const target = ratio * total
  let acc = 0
  const list = Array.isArray(clips.value) ? clips.value : []
  for (let i = 0; i < list.length; i++) {
    const dur = list[i].end - list[i].start
    if (target < acc + dur) {
      preview.value.img = `https://img.youtube.com/vi/${list[i].id}/hqdefault.jpg`
      break
    }
    acc += dur
  }
  preview.value.time = formatTime(target)
  preview.value.left = `${ratio * 100}%`
}

function dragStart(e) {
  dragging = true
  preview.value.show = true
  if (player?.value && player.value.pauseVideo) {
    player.value.pauseVideo()
  }
  pauseTracking()
  updatePreview(e.clientX)
  document.addEventListener('mousemove', dragMove)
  document.addEventListener('mouseup', dragEnd)
}

function dragMove(e) {
  if (!dragging) return
  updatePreview(e.clientX)
}

function dragEnd(e) {
  if (!dragging) return
  dragging = false
  preview.value.show = false
  document.removeEventListener('mousemove', dragMove)
  document.removeEventListener('mouseup', dragEnd)
  seekAtPosition(e.clientX, false)
}

function seekAtPosition(clientX, play = true) {
  if (!player?.value || !bar.value) return
  const rect = bar.value.getBoundingClientRect()
  const ratio = (clientX - rect.left) / rect.width
  seekAt(ratio, play)
}

function seekAt(ratio, play = true) {
  const list = Array.isArray(clips.value) ? clips.value : []
  const target = ratio * totalDuration()
  let acc = 0
  for (let i = 0; i < list.length; i++) {
    const dur = list[i].end - list[i].start
    if (target < acc + dur) {
      if (i !== current.value && playSegment) {
        playSegment(i)
      }
      const sec = list[i].start + (target - acc)
      player.value.seekTo(sec, true)
      if (!play && player.value.pauseVideo) {
        player.value.pauseVideo()
      }
      setProgress(target)
      if (play) {
        resumeTracking()
      } else {
        pauseTracking()
      }
      break
    }
    acc += dur
  }
}

function seek(e) {
  if (!bar.value) return
  seekAtPosition(e.clientX)
}
</script>
