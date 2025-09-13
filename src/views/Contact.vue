<!-- src/views/Contact.vue -->
<template>
  <div class="container">
    <h1 class="mb-3">Contact Us</h1>
    <p class="text-muted">We'd love to hear from you. Please reach out with any questions or feedback.</p>

    <form novalidate @submit.prevent="onSubmit" class="row g-3">
      <!-- Name -->
      <div class="col-md-6">
        <label class="form-label" for="name">Name</label>
        <input
          id="name"
          v-model.trim="form.name"
          @blur="touched.name = true"
          type="text"
          class="form-control"
          placeholder="Your full name"
          aria-describedby="nameHelp"
        />
        <div id="nameHelp" class="form-text">Please enter at least 2 characters.</div>
        <div v-if="showError(nameError, touched.name)" class="text-danger small mt-1">
          {{ nameError }}
        </div>
      </div>

      <!-- Email -->
      <div class="col-md-6">
        <label class="form-label" for="email">Email</label>
        <input
          id="email"
          v-model.trim="form.email"
          @blur="touched.email = true"
          type="email"
          class="form-control"
          placeholder="name@example.com"
          inputmode="email"
          autocomplete="email"
        />
        <div v-if="showError(emailError, touched.email)" class="text-danger small mt-1">
          {{ emailError }}
        </div>
      </div>

      <!-- Message -->
      <div class="col-12">
        <label class="form-label" for="message">Message</label>
        <textarea
          id="message"
          v-model.trim="form.message"
          @blur="touched.message = true"
          class="form-control"
          rows="4"
          placeholder="How can we help?"
          aria-describedby="msgHelp"
        ></textarea>
        <div id="msgHelp" class="form-text">At least 10 characters.</div>
        <div v-if="showError(messageError, touched.message)" class="text-danger small mt-1">
          {{ messageError }}
        </div>
      </div>

      <!-- Terms -->
      <div class="col-12">
        <div class="form-check">
          <input
            id="terms"
            v-model="form.terms"
            @blur="touched.terms = true"
            class="form-check-input"
            type="checkbox"
          />
          <label class="form-check-label" for="terms">
            I agree to the Privacy Policy and Terms.
          </label>
        </div>
        <div v-if="showError(termsError, touched.terms)" class="text-danger small mt-1">
          {{ termsError }}
        </div>
      </div>

      <div class="col-12">
        <button class="btn btn-success" type="submit" :disabled="!isFormValid">
          Send Message
        </button>
        <span class="ms-2 text-muted small">(The button is enabled when all fields are valid)</span>
      </div>
    </form>

    <!-- Success -->
    <div v-if="submitted" class="alert alert-success mt-4">
      Your message has been sent. We'll get back to you soon.
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { sanitizeText, sanitizeEmail } from '../utils/sanitize'

// form state
const form = reactive({
  name: '',
  email: '',
  message: '',
  terms: false
})

// "touched" Status: Error is displayed only after blur
const touched = reactive({
  name: false,
  email: false,
  message: false,
  terms: false
})

const submitted = ref(false)

// validators
const emailRE = /^\S+@\S+\.\S+$/

const nameError = computed(() => {
  if (!form.name) return 'Name is required.'
  if (form.name.length < 2) return 'Name must be at least 2 characters.'
  return ''
})

const emailError = computed(() => {
  if (!form.email) return 'Email is required.'
  if (!emailRE.test(form.email)) return 'Please enter a valid email address.'
  return ''
})

const messageError = computed(() => {
  if (!form.message) return 'Message is required.'
  if (form.message.length < 10) return 'Message must be at least 10 characters.'
  return ''
})

const termsError = computed(() => {
  if (!form.terms) return 'You must accept the terms to continue.'
  return ''
})

const isFormValid = computed(() =>
  !nameError.value && !emailError.value && !messageError.value && !termsError.value
)

function showError(error, isTouched) {
  return Boolean(error) && isTouched
}

function onSubmit() {
  // Mark all fields as touched on submission
  Object.keys(touched).forEach(k => (touched[k] = true))

  if (!isFormValid.value) return

  // Basic sanitization (avoids inserting HTML)
  const safePayload = {
    name: sanitizeText(form.name),
    email: sanitizeEmail(form.email),
    message: sanitizeText(form.message),
    ts: new Date().toISOString()
  }

  try {
    const key = 'wh_contact_msgs'
    const list = JSON.parse(localStorage.getItem(key) || '[]')
    list.push(safePayload)
    localStorage.setItem(key, JSON.stringify(list))
  } catch {}

  submitted.value = true

  // Reset Form
  form.name = ''
  form.email = ''
  form.message = ''
  form.terms = false
  Object.keys(touched).forEach(k => (touched[k] = false))
}
</script>

<style scoped>
</style>
