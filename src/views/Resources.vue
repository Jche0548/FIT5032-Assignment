<template>
    <div class="container">
      <h1 class="mb-4">Health Resources</h1>
      <p class="text-muted">Explore guides, nutrition tips, and articles to support your wellness journey.</p>
  
      <ul class="list-group">
        <li class="list-group-item" v-for="topic in topics" :key="topic">
          {{ topic }}
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  const topics = [
    "Exercise Guide: Staying Active at Home",
    "Nutrition Tips for Busy People",
    "The Benefits of Regular Physical Activity"
  ]
  </script>
  