<template>
  <div class="kanban-column">
    <div class="column-header">
      <h3 class="column-title">{{ status.name }}</h3>
      <span class="column-count">{{ issues.length }}</span>
    </div>
    <div 
      :ref="'column-' + status.id"
      class="column-content"
      :data-status-id="status.id"
    >
      <IssueCard
        v-for="issue in issues"
        :key="issue.id"
        :issue="issue"
        :data-issue-id="issue.id"
        class="issue-card-wrapper"
      />
    </div>
  </div>
</template>

<script>
import IssueCard from '../issues/IssueCard.vue'

export default {
  name: 'KanbanColumn',
  components: {
    IssueCard
  },
  props: {
    status: {
      type: Object,
      required: true
    },
    issues: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.kanban-column {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  min-width: 300px;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #dee2e6;
}

.column-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.column-count {
  background: #6c757d;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
}

.column-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 100px;
}

.issue-card-wrapper {
  margin: 0;
}
</style>
