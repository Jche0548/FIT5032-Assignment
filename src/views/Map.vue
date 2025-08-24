<template>
    <div class="container">
      <h1 class="mb-4">Community Map</h1>
      <p class="text-muted">Locate nearby facilities, clubs, and accessible services.</p>
  
      <!-- Search Bar -->
      <div class="mb-3">
        <input type="text" class="form-control" placeholder="Search for a facility or club...">
      </div>
  
      <div class="row">
        <!-- Map blocks (temporarily replaced with gray blocks) -->
        <div class="col-md-8">
          <div class="border bg-light d-flex justify-content-center align-items-center" style="height:300px;">
            Map Area (Placeholder)
          </div>
        </div>
  
        <!-- Venue list -->
        <div class="col-md-4">
          <ul class="list-group">
            <li class="list-group-item" v-for="place in places" :key="place">
              {{ place }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const places = [
    "Central Park - Football Ground",
    "Monash Aquatic Centre - Swimming",
    "Community Gym - Fitness Classes"
  ]
  </script>
  