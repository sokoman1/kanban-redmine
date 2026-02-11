import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import {
  fetchStatuses,
  fetchAllIssues,
  updateIssueStatus,
  createIssue as apiCreateIssue,
  fetchProject
} from '../api/redmineEndpoints'

export const useBoardStore = defineStore('board', {
  state: () => ({
    statuses: [],
    issues: [],
    trackers: [],
    projectTrackers: [],
    loading: false,
    error: null
  }),

  getters: {
    issuesByStatus: (state) => {
      const grouped = {}
      
      state.statuses.forEach(status => {
        grouped[status.id] = []
      })

      state.issues.forEach(issue => {
        const statusId = issue.status?.id
        if (statusId && grouped[statusId]) {
          grouped[statusId] = [...grouped[statusId], issue]
        }
      })

      return grouped
    }
  },

  actions: {
    async loadBoardData() {
      const authStore = useAuthStore()
      
      if (!authStore.client || !authStore.selectedProject) {
        this.error = 'Не выбран проект или не настроена авторизация'
        return
      }

      this.loading = true
      this.error = null

      try {
        const projectId = authStore.selectedProject.id
        const [statuses, issues, project] = await Promise.all([
          fetchStatuses(authStore.client),
          fetchAllIssues(authStore.client, projectId),
          fetchProject(authStore.client, projectId, { include: ['trackers', 'issue_custom_fields'] })
        ])

        const projectTrackers = project?.trackers ?? []

        this.statuses = [...statuses]
        this.issues = [...issues]
        this.trackers = projectTrackers
        this.projectTrackers = projectTrackers
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async moveIssue(issueId, newStatusId) {
      const authStore = useAuthStore()
      
      if (!authStore.client) {
        throw new Error('Клиент не инициализирован')
      }

      const issueIndex = this.issues.findIndex(i => i.id === issueId)
      if (issueIndex === -1) {
        throw new Error('Задача не найдена')
      }

      const originalIssue = this.issues[issueIndex]
      const oldStatusId = originalIssue.status?.id

      if (oldStatusId === newStatusId) {
        return
      }

      const optimisticIssue = {
        ...originalIssue,
        status: {
          ...originalIssue.status,
          id: newStatusId
        }
      }

      this.issues = [
        ...this.issues.slice(0, issueIndex),
        optimisticIssue,
        ...this.issues.slice(issueIndex + 1)
      ]

      try {
        await updateIssueStatus(authStore.client, issueId, newStatusId)
      } catch (error) {
        this.issues = [
          ...this.issues.slice(0, issueIndex),
          originalIssue,
          ...this.issues.slice(issueIndex + 1)
        ]
        throw error
      }
    },

    async createIssue(issueData) {
      const authStore = useAuthStore()
      
      if (!authStore.client || !authStore.selectedProject) {
        throw new Error('Клиент не инициализирован или проект не выбран')
      }

      const effectiveTrackerId = issueData.tracker_id ?? this.projectTrackers[0]?.id
      const dataWithProject = {
        ...issueData,
        project_id: authStore.selectedProject.id
      }

      if (effectiveTrackerId) {
        dataWithProject.tracker_id = effectiveTrackerId
      }

      const newIssue = await apiCreateIssue(authStore.client, dataWithProject)
      
      this.issues = [...this.issues, newIssue]
      
      return newIssue
    },

    clearError() {
      this.error = null
    },

    reset() {
      this.statuses = []
      this.issues = []
      this.trackers = []
      this.projectTrackers = []
      this.loading = false
      this.error = null
    }
  }
})
