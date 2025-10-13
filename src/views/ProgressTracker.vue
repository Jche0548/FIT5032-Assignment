<script setup>
import { ref, computed, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const modelName = 'gemini-2.5-flash'

// --- status ---
const scores = ref([])  // { date, score }
const newScore = ref('')
const chartRef = ref(null)
let chart = null
const analysis = ref('')
const loading = ref(false)

// --- Load data ---
onMounted(() => {
  const saved = localStorage.getItem('wh_progress')
  if (saved) scores.value = JSON.parse(saved)
  renderChart()
})

// --- Store and update ---
function addProgress() {
  if (!newScore.value || newScore.value < 1 || newScore.value > 5) {
    alert('Please enter a score between 1 and 5.')
    return
  }
  const today = new Date().toISOString().split('T')[0]
  const exist = scores.value.find(s => s.date === today)
  if (exist) exist.score = Number(newScore.value)
  else scores.value.push({ date: today, score: Number(newScore.value) })

  localStorage.setItem('wh_progress', JSON.stringify(scores.value))
  newScore.value = ''
  renderChart()
}

// --- Draw a chart ---
function renderChart() {
  if (!chartRef.value) return
  const ctx = chartRef.value.getContext('2d')
  if (chart) chart.destroy()
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: scores.value.map(s => s.date),
      datasets: [{
        label: 'Daily Progress (1-5)',
        data: scores.value.map(s => s.score),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      scales: {
        y: { min: 0, max: 5, ticks: { stepSize: 1 } }
      }
    }
  })
}

// --- Gemini analyse ---
async function analyzeProgress() {
  if (!API_KEY) {
    alert('Missing Gemini API key.')
    return
  }

  loading.value = true
  analysis.value = ''
  try {
    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: modelName })

    const prompt = `
You are a professional health coach.
Analyze this 2-week user progress dataset (1-5 rating scale):
${JSON.stringify(scores.value, null, 2)}

Provide:
1. A brief summary of improvement or decline.
2. Motivation or advice to maintain consistency.
3. If needed, recommend intensity adjustments.

Respond concisely in friendly tone.
    `.trim()

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    analysis.value = text || 'No response from Gemini.'
  } catch (err) {
    analysis.value = 'Error: ' + err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">
    <h1 class="mb-3">Progress Tracker</h1>
    <p class="text-muted">
      Log your daily training progress (1-5). View trends and get AI feedback.
    </p>

    <div class="card shadow-sm mb-3 p-3">
      <div class="d-flex gap-2 align-items-center">
        <input v-model="newScore" type="number" min="1" max="5" class="form-control" placeholder="Enter 1-5" />
        <button class="btn btn-primary" @click="addProgress">Add</button>
      </div>
    </div>

    <div class="card shadow-sm mb-3 p-3">
      <canvas ref="chartRef" height="120"></canvas>
    </div>

    <div class="text-center">
      <button class="btn btn-success" :disabled="loading" @click="analyzeProgress">
        {{ loading ? 'Analyzing...' : 'Analyze Progress with Gemini' }}
      </button>
    </div>

    <div v-if="analysis" class="alert alert-info mt-3" style="white-space: pre-wrap;">
      {{ analysis }}
    </div>
  </div>
</template>

<style scoped>
canvas { width: 100%; }
</style>