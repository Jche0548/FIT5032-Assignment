<template>
  <div>
    <h1 class="mb-3">Activities & Events</h1>
    <p class="text-muted mb-4">Discover community sport programs and register online.</p>

    <div class="row g-3">
      <div class="col-12 col-md-6 col-lg-4" v-for="n in 6" :key="n">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Activity {{ n }}</h5>
            <p class="card-text">Date, time, location...</p>
            <button class="btn btn-primary btn-sm">Register</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
