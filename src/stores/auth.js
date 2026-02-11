import { defineStore } from 'pinia'
import { createRedmineClient } from '../api/redmineClient'

const STORAGE_KEYS = {
  BASE_URL: 'redmine_base_url',
  API_KEY: 'redmine_api_key',
  SELECTED_PROJECT: 'redmine_selected_project'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    baseUrl: localStorage.getItem(STORAGE_KEYS.BASE_URL) || '',
    apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
    selectedProject: JSON.parse(localStorage.getItem(STORAGE_KEYS.SELECTED_PROJECT) || 'null')
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.baseUrl && state.apiKey),
    
    client: (state) => {
      if (!state.baseUrl || !state.apiKey) {
        return null
      }
      return createRedmineClient(state.baseUrl, state.apiKey)
    }
  },

  actions: {
    setCredentials(baseUrl, apiKey) {
      const newState = {
        baseUrl,
        apiKey,
        selectedProject: null
      }

      this.baseUrl = newState.baseUrl
      this.apiKey = newState.apiKey
      this.selectedProject = newState.selectedProject

      localStorage.setItem(STORAGE_KEYS.BASE_URL, baseUrl)
      localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey)
      localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT)
    },

    setSelectedProject(project) {
      this.selectedProject = project ? { ...project } : null
      
      if (project) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT, JSON.stringify(project))
      } else {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT)
      }
    },

    logout() {
      this.baseUrl = ''
      this.apiKey = ''
      this.selectedProject = null

      localStorage.removeItem(STORAGE_KEYS.BASE_URL)
      localStorage.removeItem(STORAGE_KEYS.API_KEY)
      localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT)
    }
  }
})
