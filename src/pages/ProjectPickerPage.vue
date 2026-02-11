<template>
  <div class="project-picker-page">
    <div class="container">
      <div class="picker-card card">
        <div class="header">
          <h1>Выберите проект</h1>
          <button @click="handleLogout" class="btn btn-secondary btn-sm">
            Выйти
          </button>
        </div>

        <AppErrorBanner 
          :error="error" 
          :onRetry="loadProjects"
          @close="error = ''"
        />

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
        </div>

        <div v-else-if="projects.length === 0 && !error" class="empty-state">
          <p>Проекты не найдены</p>
        </div>

        <div v-else class="projects-list">
          <div
            v-for="project in projects"
            :key="project.id"
            class="project-item"
            @click="handleSelectProject(project)"
          >
            <div class="project-info">
              <h3>{{ project.name }}</h3>
              <p v-if="project.description" class="project-description">
                {{ project.description }}
              </p>
              <small class="project-id">ID: {{ project.identifier }}</small>
            </div>
            <span class="arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { fetchProjects } from '../api/redmineEndpoints'
import AppErrorBanner from '../components/common/AppErrorBanner.vue'

export default {
  name: 'ProjectPickerPage',
  components: {
    AppErrorBanner
  },
  setup() {
    const router = useRouter()
    return { router }
  },
  data() {
    return {
      projects: [],
      loading: false,
      error: ''
    }
  },
  mounted() {
    this.loadProjects()
  },
  methods: {
    async loadProjects() {
      const authStore = useAuthStore()
      
      if (!authStore.client) {
        this.error = 'Клиент не инициализирован'
        return
      }

      this.loading = true
      this.error = ''

      try {
        this.projects = await fetchProjects(authStore.client)
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    handleSelectProject(project) {
      const authStore = useAuthStore()
      authStore.setSelectedProject(project)
      this.router.push('/board')
    },

    handleLogout() {
      const authStore = useAuthStore()
      authStore.logout()
      this.router.push('/login')
    }
  }
}
</script>

<style scoped>
.project-picker-page {
  min-height: 100vh;
  padding: 40px 0;
  background: #f5f5f5;
}

.picker-card {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  font-size: 24px;
  margin: 0;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.project-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
  transform: translateX(4px);
}

.project-info {
  flex: 1;
}

.project-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.project-description {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.project-id {
  color: #999;
  font-size: 12px;
}

.arrow {
  font-size: 24px;
  color: #007bff;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
