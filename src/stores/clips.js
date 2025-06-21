import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useClips = defineStore('clips', () => {
  const clips = ref([]);
  const current = ref(0);
  const progress = ref(0);
  const tracking = ref(true);

  function move(oldIndex, newIndex) {
    if (oldIndex === newIndex) return;
    const list = clips.value;
    if (oldIndex < 0 || oldIndex >= list.length) return;
    if (newIndex < 0 || newIndex >= list.length) return;
    const item = list.splice(oldIndex, 1)[0];
    list.splice(newIndex, 0, item);
  }

  function add(clip) {
    clips.value.push(clip);
  }

  function setClips(list) {
    clips.value = JSON.parse(JSON.stringify(list));
  }

  function remove(index) {
    clips.value.splice(index, 1);
  }

  function next() {
    if (current.value + 1 < clips.value.length) {
      current.value += 1;
    }
  }

  function setCurrent(idx) {
    current.value = idx
  }

  function reset() {
    current.value = 0
  }

  function encode() {
    return btoa(unescape(encodeURIComponent(
      clips.value.map(c => `${c.id},${c.start},${c.end}`).join('|')
    )));
  }

  function loadEncoded(str) {
    try {
      const decoded = decodeURIComponent(escape(atob(str)));
      const parts = decoded.split('|').filter(Boolean);
      clips.value = parts.map(p => {
        const [id, s, e] = p.split(',');
        return { id, start: Number(s), end: Number(e) };
      });
    } catch (e) {
      console.error('Failed to parse data parameter', e);
    }
  }

  function setProgress(sec) {
    progress.value = sec;
  }

  function pauseTracking() {
    tracking.value = false;
  }

  function resumeTracking() {
    tracking.value = true;
  }

  const totalDuration = () =>
    clips.value.reduce((sum, c) => sum + (c.end - c.start), 0);

  const offsets = () => {
    const arr = [];
    let acc = 0;
    for (const c of clips.value) {
      arr.push(acc);
      acc += c.end - c.start;
    }
    return arr;
  };

  return {
    clips,
    current,
    add,
    remove,
    next,
    setCurrent,
    reset,
    move,
    setClips,
    encode,
    loadEncoded,
    progress,
    setProgress,
    pauseTracking,
    resumeTracking,
    totalDuration,
    offsets,
    tracking
  };
});
