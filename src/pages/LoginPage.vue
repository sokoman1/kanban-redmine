<template>
  <div class="login-page">
    <div class="container">
      <div class="login-card card">
        <h1>Kanban Redmine</h1>
        <p class="subtitle">Введите настройки подключения к Redmine</p>

        <AppErrorBanner 
          :error="error" 
          @close="error = ''"
        />

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label" for="baseUrl">
              URL Redmine
            </label>
            <input
              id="baseUrl"
              v-model="formData.baseUrl"
              type="text"
              class="form-input"
              placeholder="https://redmine.example.com"
              required
            />
            <div v-if="validationErrors.baseUrl" class="error-message">
              {{ validationErrors.baseUrl }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="apiKey">
              API Key
            </label>
            <input
              id="apiKey"
              v-model="formData.apiKey"
              type="password"
              class="form-input"
              placeholder="Введите API key"
              required
            />
            <div v-if="validationErrors.apiKey" class="error-message">
              {{ validationErrors.apiKey }}
            </div>
            <small style="display: block; margin-top: 5px; color: #666;">
              API key можно найти в Redmine: Моя учетная запись → Справа "Ключ для доступа к API"
            </small>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-full"
            :disabled="loading"
          >
            {{ loading ? 'Проверка...' : 'Войти' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { validateAuthSettings } from '../utils/validate'
import { fetchProjects } from '../api/redmineEndpoints'
import { createRedmineClient } from '../api/redmineClient'
import AppErrorBanner from '../components/common/AppErrorBanner.vue'

export default {
  name: 'LoginPage',
  components: {
    AppErrorBanner
  },
  setup() {
    const router = useRouter()
    return { router }
  },
  data() {
    return {
      formData: {
        baseUrl: '',
        apiKey: ''
      },
      validationErrors: {},
      error: '',
      loading: false
    }
  },
  mounted() {
    const authStore = useAuthStore()
    if (authStore.baseUrl) {
      this.formData.baseUrl = authStore.baseUrl
    }
    if (authStore.apiKey) {
      this.formData.apiKey = authStore.apiKey
    }
  },
  methods: {
    async handleLogin() {
      this.validationErrors = {}
      this.error = ''

      const cleanBaseUrl = this.formData.baseUrl.trim().replace(/\/$/, '')
      const validation = validateAuthSettings({
        baseUrl: cleanBaseUrl,
        apiKey: this.formData.apiKey.trim()
      })

      if (!validation.success) {
        this.validationErrors = validation.errors
        return
      }

      this.loading = true

      try {
        const client = createRedmineClient(cleanBaseUrl, this.formData.apiKey.trim())
        await fetchProjects(client)

        const authStore = useAuthStore()
        authStore.setCredentials(cleanBaseUrl, this.formData.apiKey.trim())
        this.router.push('/projects')
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
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  max-width: 450px;
  width: 100%;
}

h1 {
  font-size: 28px;
  margin-bottom: 8px;
  color: #333;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
}

.btn-full {
  width: 100%;
  margin-top: 10px;
}
</style>
