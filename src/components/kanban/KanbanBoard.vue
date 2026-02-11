<template>
  <div class="kanban-board">
    <KanbanColumn
      v-for="status in statuses"
      :key="status.id"
      :status="status"
      :issues="issuesByStatus[status.id] || []"
      :ref="'column-' + status.id"
    />
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import KanbanColumn from './KanbanColumn.vue'
import { useBoardStore } from '../../stores/board'

export default {
  name: 'KanbanBoard',
  components: {
    KanbanColumn
  },
  props: {
    statuses: {
      type: Array,
      required: true
    },
    issuesByStatus: {
      type: Object,
      required: true
    }
  },
  mounted() {
    this.initializeDragAndDrop()
  },
  beforeUnmount() {
    this._isDestroyed = true
    this.destroyDragAndDrop()
  },
  data() {
    return {
      sortableInstances: [],
      _isDestroyed: false
    }
  },
  methods: {
    initializeDragAndDrop() {
      if (!Array.isArray(this.sortableInstances)) return

      this.statuses.forEach(status => {
        const columnRef = this.$refs['column-' + status.id]
        const columnComponent = Array.isArray(columnRef) ? columnRef[0] : columnRef
        if (!columnComponent?.$el) return

        const columnElement = columnComponent.$el.querySelector('.column-content')
        if (!columnElement) return

        const sortable = new Sortable(columnElement, {
          group: 'issues',
          animation: 150,
          draggable: '.issue-card-wrapper',
          ghostClass: 'ghost',
          
          onEnd: async (evt) => {
            const issueId = parseInt(evt.item.dataset.issueId)
            const newStatusId = parseInt(evt.to.dataset.statusId)
            
            if (!issueId || !newStatusId) return

            const boardStore = useBoardStore()
            
            try {
              await boardStore.moveIssue(issueId, newStatusId)
            } catch (error) {
              this.$emit('move-error', error.message)
            }
          }
        })

        this.sortableInstances.push(sortable)
      })
    },

    destroyDragAndDrop() {
      if (!Array.isArray(this.sortableInstances)) return

      this.sortableInstances.forEach(instance => {
        if (instance && instance.destroy) {
          instance.destroy()
        }
      })
      this.sortableInstances = []
    }
  },
  watch: {
    statuses() {
      this.$nextTick(() => {
        if (this._isDestroyed) return
        this.destroyDragAndDrop()
        this.initializeDragAndDrop()
      })
    }
  },
  emits: ['move-error']
}
</script>

<style scoped>
.kanban-board {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 20px 0;
  min-height: 500px;
}

:deep(.ghost) {
  opacity: 0.4;
  background: #e3f2fd;
}
</style>
