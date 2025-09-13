<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },   
  count: { type: Number, default: 0 }, 
  editable: { type: Boolean, default: false }, 
  userScore: { type: Number, default: null } 
})
const emit = defineEmits(['rate'])

const stars = [1, 2, 3, 4, 5]
const hover = ref(0)

const label = computed(() => {
  const v = (props.value || 0).toFixed(2)
  const c = props.count || 0
  return `${v} (${c})`
})

function onEnter(s) {
  if (!props.editable) return
  hover.value = s
}
function onLeave() {
  if (!props.editable) return
  hover.value = 0
}
function onClick(s) {
  if (!props.editable) return
  emit('rate', s)
}
</script>

<template>
  <div class="d-flex align-items-center gap-2">
    <!-- Star list -->
    <div class="d-inline-flex" @mouseleave="onLeave">
      <button
        v-for="s in stars"
        :key="s"
        type="button"
        class="btn btn-sm p-0 border-0 bg-transparent star-btn"
        :aria-label="`Rate ${s}`"
        :disabled="!editable"
        @mouseenter="onEnter(s)"
        @focus="onEnter(s)"
        @click="onClick(s)"
      >
        <span
          class="star"
          :class="{
            'active': (hover || userScore || Math.round(value)) >= s,
            'editable': editable
          }"
        >★</span>
      </button>
    </div>

    <span class="text-muted small">{{ label }}</span>
    <span v-if="editable && userScore" class="badge bg-secondary">Your: {{ userScore }}</span>
  </div>
</template>

<style scoped>
.star {
  font-size: 1.1rem;
  line-height: 1;
  color: #c9c9c9; 
  transition: transform 120ms ease, color 120ms ease;
}
.star.active {
  color: #ffb400; 
}
.star-btn:disabled {
  cursor: default;
}
.star.editable {
  cursor: pointer;
}
.star-btn:hover .star.editable {
  transform: scale(1.12);
}
</style>
