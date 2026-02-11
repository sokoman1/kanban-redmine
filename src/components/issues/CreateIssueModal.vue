<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Создать задачу</h2>
        <button class="btn-close" @click="close">×</button>
      </div>

      <AppErrorBanner 
        :error="error" 
        @close="error = ''"
      />

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label" for="subject">
            Тема *
          </label>
          <input
            id="subject"
            v-model="formData.subject"
            type="text"
            class="form-input"
            placeholder="Введите тему задачи"
            required
          />
          <div v-if="validationErrors.subject" class="error-message">
            {{ validationErrors.subject }}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="description">
            Описание
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            class="form-textarea"
            placeholder="Опишите задачу (необязательно)"
          />
        </div>

        <div v-if="trackers.length > 0" class="form-group">
          <label class="form-label" for="tracker">
            Трекер
          </label>
          <select
            id="tracker"
            v-model="formData.trackerId"
            class="form-input"
          >
            <option :value="null">Не выбран</option>
            <option
              v-for="tracker in trackers"
              :key="tracker.id"
              :value="tracker.id"
            >
              {{ tracker.name }}
            </option>
          </select>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="close">
            Отмена
          </button>
          <button type="submit" class="btn btn-success" :disabled="loading">
            {{ loading ? 'Создание...' : 'Создать' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useBoardStore } from '../../stores/board'
import { validateCreateIssue } from '../../utils/validate'
import AppErrorBanner from '../common/AppErrorBanner.vue'

export default {
  name: 'CreateIssueModal',
  components: {
    AppErrorBanner
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    trackers: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'created'],
  data() {
    return {
      formData: {
        subject: '',
        description: '',
        trackerId: null
      },
      validationErrors: {},
      error: '',
      loading: false
    }
  },
  methods: {
    close() {
      this.resetForm()
      this.$emit('close')
    },

    resetForm() {
      this.formData = {
        subject: '',
        description: '',
        trackerId: null
      }
      this.validationErrors = {}
      this.error = ''
      this.loading = false
    },

    async handleSubmit() {
      this.validationErrors = {}
      this.error = ''

      const validation = validateCreateIssue({
        subject: this.formData.subject.trim(),
        description: this.formData.description.trim() || undefined,
        trackerId: this.formData.trackerId || undefined
      })

      if (!validation.success) {
        this.validationErrors = validation.errors
        return
      }

      this.loading = true

      try {
        const boardStore = useBoardStore()
        
        const issueData = {
          subject: this.formData.subject.trim()
        }

        if (this.formData.description.trim()) {
          issueData.description = this.formData.description.trim()
        }

        if (this.formData.trackerId) {
          issueData.tracker_id = this.formData.trackerId
        }

        const newIssue = await boardStore.createIssue(issueData)
        
        this.$emit('created', newIssue)
        this.close()
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 32px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-close:hover {
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>
