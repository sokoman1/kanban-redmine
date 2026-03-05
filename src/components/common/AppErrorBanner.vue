<template>
  <div v-if="error" class="error-banner">
    <div class="error-content">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ error }}</span>
    </div>
    <div class="error-actions">
      <button v-if="onRetry" @click="onRetry" class="btn btn-secondary btn-sm">
        Retry
      </button>
      <button @click="$emit('close')" class="btn-close">×</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppErrorBanner',
  props: {
    error: {
      type: String,
      default: ''
    },
    onRetry: {
      type: Function,
      default: null
    }
  },
  emits: ['close']
}
</script>

<style scoped>
.error-banner {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.error-icon {
  font-size: 20px;
}

.error-text {
  color: #721c24;
  font-size: 14px;
}

.error-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #721c24;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-close:hover {
  opacity: 0.7;
}
</style>
