<template>
    <div class="container">
      <h1 class="mb-4">Contact Us</h1>
      <p class="text-muted">We would love to hear from you. Please reach out with any questions or feedback.</p>
  
      <form @submit.prevent="submitForm" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Name</label>
          <input v-model="form.name" type="text" class="form-control" required>
        </div>
  
        <div class="col-md-6">
          <label class="form-label">Email</label>
          <input v-model="form.email" type="email" class="form-control" required>
        </div>
  
        <div class="col-12">
          <label class="form-label">Message</label>
          <textarea v-model="form.message" class="form-control" rows="4" required></textarea>
        </div>
  
        <div class="col-12">
          <button type="submit" class="btn btn-success">Send Message</button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { reactive } from 'vue'
  
  const form = reactive({
    name: '',
    email: '',
    message: ''
  })
  
  function submitForm() {
    alert(`Message sent!\nName: ${form.name}\nEmail: ${form.email}\nMessage: ${form.message}`)
  }
  </script>
  