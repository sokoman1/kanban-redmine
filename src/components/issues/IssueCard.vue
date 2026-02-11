<template>
  <div class="issue-card">
    <div class="issue-header">
      <span class="issue-id">#{{ issue.id }}</span>
      <span v-if="issue.tracker" class="issue-tracker">
        {{ issue.tracker.name }}
      </span>
    </div>
    <h4 class="issue-subject">{{ issue.subject }}</h4>
    <div v-if="issue.assigned_to" class="issue-assignee">
      Назначена: {{ issue.assigned_to.name }}
    </div>
    <div v-if="issue.priority" class="issue-priority" :class="priorityClass">
      {{ issue.priority.name }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'IssueCard',
  props: {
    issue: {
      type: Object,
      required: true
    }
  },
  computed: {
    priorityClass() {
      const priorityName = this.issue.priority?.name?.toLowerCase() || ''
      if (priorityName.includes('высок') || priorityName.includes('high')) {
        return 'priority-high'
      }
      if (priorityName.includes('низк') || priorityName.includes('low')) {
        return 'priority-low'
      }
      return 'priority-normal'
    }
  }
}
</script>

<style scoped>
.issue-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  cursor: grab;
  transition: box-shadow 0.2s;
}

.issue-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.issue-card:active {
  cursor: grabbing;
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.issue-id {
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

.issue-tracker {
  font-size: 11px;
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 3px;
  color: #666;
}

.issue-subject {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
}

.issue-assignee {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.issue-priority {
  display: inline-block;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 3px;
  font-weight: 500;
}

.priority-high {
  background: #fee;
  color: #d00;
}

.priority-normal {
  background: #f0f0f0;
  color: #666;
}

.priority-low {
  background: #eff;
  color: #066;
}
</style>
