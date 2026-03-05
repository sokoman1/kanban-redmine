<template>
  <div class="board-page">
    <div class="board-header">
      <div class="header-left">
        <h1>{{ projectName }}</h1>
        <button @click="handleChangeProject" class="btn btn-secondary btn-sm">
          Change project
        </button>
      </div>
      <div class="header-right">
        <button @click="openCreateModal" class="btn btn-success">
          + Create issue
        </button>
        <button @click="handleRefresh" class="btn btn-secondary" :disabled="loading">
          {{ loading ? 'Refreshing...' : '↻ Refresh' }}
        </button>
      </div>
    </div>

    <AppErrorBanner 
      :error="error" 
      :onRetry="loadBoard"
      @close="clearError"
    />

    <div v-if="loading && statuses.length === 0" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="statuses.length > 0" class="board-container">
      <KanbanBoard
        :statuses="statuses"
        :issuesByStatus="issuesByStatus"
        @move-error="handleMoveError"
      />
    </div>

    <div v-else class="empty-state">
      <p>No data to display</p>
    </div>

    <CreateIssueModal
      :isOpen="isCreateModalOpen"
      :trackers="trackers"
      @close="closeCreateModal"
      @created="handleIssueCreated"
    />
  </div>
</template>

<script>
import { useBoardStore } from '../stores/board'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import KanbanBoard from '../components/kanban/KanbanBoard.vue'
import CreateIssueModal from '../components/issues/CreateIssueModal.vue'
import AppErrorBanner from '../components/common/AppErrorBanner.vue'

export default {
  name: 'BoardPage',
  components: {
    KanbanBoard,
    CreateIssueModal,
    AppErrorBanner
  },
  setup() {
    const boardStore = useBoardStore()
    const authStore = useAuthStore()
    const router = useRouter()

    const { statuses, issuesByStatus, loading, error, trackers } = storeToRefs(boardStore)

    return {
      boardStore,
      authStore,
      router,
      statuses,
      issuesByStatus,
      loading,
      error,
      trackers
    }
  },
  data() {
    return {
      isCreateModalOpen: false
    }
  },
  computed: {
    projectName() {
      return this.authStore.selectedProject?.name || 'Untitled'
    }
  },
  mounted() {
    this.loadBoard()
  },
  beforeUnmount() {
    this.boardStore.reset()
  },
  methods: {
    async loadBoard() {
      try {
        await this.boardStore.loadBoardData()
      } catch (error) {
        // Ошибка уже в сторе
      }
    },

    async handleRefresh() {
      await this.loadBoard()
    },

    handleChangeProject() {
      this.authStore.setSelectedProject(null)
      this.router.push('/projects')
    },

    openCreateModal() {
      this.isCreateModalOpen = true
    },

    closeCreateModal() {
      this.isCreateModalOpen = false
    },

    handleIssueCreated() {
      // Задача уже добавлена в store
    },

    handleMoveError(errorMessage) {
      this.boardStore.error = errorMessage
    },

    clearError() {
      this.boardStore.clearError()
    }
  }
}
</script>

<style scoped>
.board-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.board-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h1 {
  margin: 0;
  font-size: 22px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.board-container {
  padding: 20px;
  overflow-x: auto;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}
</style>
