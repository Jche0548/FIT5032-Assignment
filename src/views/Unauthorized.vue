<template>
    <div class="container">
      <h1 class="mb-3">Unauthorized</h1>
      <p class="text-muted">Sorry, You don't have any permission to view this page.</p>
      <RouterLink class="btn btn-primary" to="/">Go Home</RouterLink>
    </div>
  </template>
  <script setup>
  import { RouterLink } from 'vue-router'
  </script>
  