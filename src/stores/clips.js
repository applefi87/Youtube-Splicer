import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useClips = defineStore('clips', () => {
  const clips = ref([]);
  const current = ref(0);

  function add(clip) {
    clips.value.push(clip);
  }

  function remove(index) {
    clips.value.splice(index, 1);
  }

  function next() {
    if (current.value + 1 < clips.value.length) {
      current.value += 1;
    }
  }

  return { clips, current, add, remove, next };
});
