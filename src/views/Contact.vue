<template>
  <div class="container">
    <h1 class="mb-3">Contact Us</h1>
    <p class="text-muted">We'd love to hear from you. Please reach out with any questions or feedback.</p>

    <form novalidate @submit.prevent="onSubmit" class="row g-3">
      <!-- Name (required + minimum length 2) -->
      <div class="col-md-6">
        <label class="form-label">Name</label>
        <input
          v-model.trim="form.name"
          @blur="touched.name = true"
          :class="inputClass(nameError)"
          type="text"
          class="form-control"
          placeholder="Your full name"
          aria-describedby="nameHelp"
          aria-invalid="true"
        />
        <div id="nameHelp" class="form-text">Please enter at least 2 characters.</div>
        <div v-if="showError(nameError, touched.name)" class="invalid-feedback d-block">
          {{ nameError }}
        </div>
      </div>

      <!-- Email (required + Email format)-->
      <div class="col-md-6">
        <label class="form-label">Email</label>
        <input
          v-model.trim="form.email"
          @blur="touched.email = true"
          :class="inputClass(emailError)"
          type="email"
          class="form-control"
          placeholder="name@example.com"
          aria-invalid="true"
        />
        <div v-if="showError(emailError, touched.email)" class="invalid-feedback d-block">
          {{ emailError }}
        </div>
      </div>

      <!-- Message (required + minimum length 10)-->
      <div class="col-12">
        <label class="form-label">Message</label>
        <textarea
          v-model.trim="form.message"
          @blur="touched.message = true"
          :class="inputClass(messageError)"
          class="form-control"
          rows="4"
          placeholder="How can we help?"
          aria-invalid="true"
        ></textarea>
        <div v-if="showError(messageError, touched.message)" class="invalid-feedback d-block">
          {{ messageError }}
        </div>
      </div>

      <!-- Terms (required) -->
      <div class="col-12 form-check">
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
        <div v-if="showError(termsError, touched.terms)" class="invalid-feedback d-block">
          {{ termsError }}
        </div>
      </div>

      <div class="col-12">
        <button class="btn btn-success" type="submit" :disabled="!isFormValid">
          Send Message
        </button>
        <span class="ms-2 text-muted small">(Button enables when all fields are valid)</span>
      </div>
    </form>

    <!-- Success Message -->
    <div v-if="submitted" class="alert alert-success mt-4">
       Your message has been sent. We'll get back to you soon.
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'

// Form Information
const form = reactive({
  name: '',
  email: '',
  message: '',
  terms: false
})

// Touch status (errors are displayed only after blurring; they will be marked when submitting)
const touched = reactive({
  name: false,
  email: false,
  message: false,
  terms: false
})

const submitted = ref(false)

// Validation Rules
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

// Is the overall effectiveness
const isFormValid = computed(() =>
  !nameError.value && !emailError.value && !messageError.value && !termsError.value
)

// Auxiliary: Display error and input box style
function showError(error, isTouched) {
  return Boolean(error) && isTouched
}
function inputClass(error) {
  return ['form-control', error ? 'is-invalid' : (error === '' ? 'is-valid' : '')]
}

// submit
function onSubmit() {
  // Treat all fields as touched on submission
  Object.keys(touched).forEach(k => touched[k] = true)

  if (isFormValid.value) {
    submitted.value = true
    // Clear the form (you can also choose to keep it)
    form.name = ''
    form.email = ''
    form.message = ''
    form.terms = false
    Object.keys(touched).forEach(k => touched[k] = false)
  }
}
</script>
