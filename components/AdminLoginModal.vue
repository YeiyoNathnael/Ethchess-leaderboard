<template>
  <div v-if="isOpen" class="login-overlay" @click.self="$emit('close')">
    <div class="login-modal editorial-card">
      <div class="modal-header">
        <div class="header-icon-box">
          <Lock class="lock-icon" />
        </div>
        <div>
          <h3 class="modal-title">ADMIN ACCESS LOGIN</h3>
          <p class="modal-sub">Enter administrator credentials to access roster management & tournament sync</p>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <X class="close-icon" />
        </button>
      </div>

      <form @submit.prevent="submitLogin" class="login-form">
        <div class="form-group">
          <label class="form-label">ADMIN PASSWORD</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="Enter admin password..."
            class="form-input"
            required
            ref="passwordInput"
          />
        </div>

        <div v-if="errorMessage" class="error-box">
          {{ errorMessage }}
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary full-width" :disabled="isLoading">
            {{ isLoading ? 'VERIFYING...' : 'AUTHENTICATE ADMIN' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { Lock, X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'authenticated']);

const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const passwordInput = ref(null);

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    password.value = '';
    errorMessage.value = '';
    nextTick(() => {
      passwordInput.value?.focus();
    });
  }
});

const submitLogin = async () => {
  if (!password.value) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { password: password.value }
    });

    if (res.success) {
      emit('authenticated');
      emit('close');
    }
  } catch (err) {
    errorMessage.value = err.statusMessage || err.message || 'Authentication failed. Check admin password.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 24, 39, 0.4);
  backdrop-filter: blur(2px);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-modal {
  width: 100%;
  max-width: 420px;
  padding: 28px;
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sharp);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
  position: relative;
}

.header-icon-box {
  width: 34px;
  height: 34px;
  background: var(--color-dark);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: var(--radius-sharp);
}

.lock-icon, .close-icon {
  width: 16px;
  height: 16px;
}

.modal-title {
  font-size: 1.05rem;
  line-height: 1.2;
}

.modal-sub {
  font-size: 0.8rem;
  color: var(--color-dark-muted);
  margin-top: 4px;
}

.close-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-dark-muted);
}

.close-btn:hover {
  color: var(--color-dark);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-family: var(--font-title);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-dark-muted);
}

.form-input {
  width: 100%;
  border: 1px solid #D1D5DB;
}

.error-box {
  background: rgba(226, 114, 91, 0.1);
  color: var(--color-terracotta);
  border: 1px solid var(--color-terracotta);
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: var(--radius-sharp);
}

.full-width {
  width: 100%;
  justify-content: center;
}
</style>
