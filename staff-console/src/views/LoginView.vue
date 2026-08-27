<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const identifier = ref('');
const password = ref('');
const errorMessage = ref<string | null>(null);
const isSubmitting = ref(false);

const auth = useAuthStore();
const router = useRouter();

function homeRouteForRole(role: string | null) {
  if (role === 'TEACHER') return { name: 'teacher-home' };
  return { name: 'admin-home' };
}

async function onSubmit() {
  errorMessage.value = null;
  isSubmitting.value = true;
  try {
    await auth.login(identifier.value, password.value);
    await router.push(homeRouteForRole(auth.role));
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <form class="login-card" @submit.prevent="onSubmit">
      <h1 class="brand">SEEDS Staff Console</h1>
      <p class="subtitle">Sign in with your school account</p>

      <label class="field">
        <span>Email or GR number</span>
        <input
          name="identifier"
          type="text"
          v-model="identifier"
          autocomplete="username"
          required
        />
      </label>

      <label class="field">
        <span>Password</span>
        <input
          name="password"
          type="password"
          v-model="password"
          autocomplete="current-password"
          required
        />
      </label>

      <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f6f1;
}
.login-card {
  width: min(360px, 90vw);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  background: #ffffff;
  border: 1px solid #dcdfd5;
  border-radius: 10px;
  padding: 2rem;
}
.brand {
  font-size: 1.3rem;
  margin: 0;
  color: #1b2420;
}
.subtitle {
  margin: 0 0 0.5rem;
  color: #6e766c;
  font-size: 0.9rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #333b34;
}
input {
  padding: 0.55rem 0.7rem;
  border: 1px solid #dcdfd5;
  border-radius: 6px;
  font-size: 0.95rem;
}
button {
  margin-top: 0.4rem;
  padding: 0.65rem;
  border: none;
  border-radius: 6px;
  background: #2e5c4c;
  color: white;
  font-weight: 600;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  margin: 0;
  color: #a6473a;
  font-size: 0.85rem;
}
</style>
