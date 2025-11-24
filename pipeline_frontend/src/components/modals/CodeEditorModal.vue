<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container large">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>
        <div class="modal-body">
          <div class="editor-container">
            <monaco-editor
              v-model="localCode"
              language="python"
              :options="editorOptions"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
          <button class="btn btn-primary" @click="handleSave">Save</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import MonacoEditor from 'monaco-editor-vue3'

const props = defineProps<{
  show: boolean
  title: string
  code: string
}>()

const emit = defineEmits(['close', 'save'])

const localCode = ref('')

const editorOptions = {
  automaticLayout: true,
  fontSize: 14,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: 'on'
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    localCode.value = props.code
  }
})

function handleSave() {
  emit('save', localCode.value)
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

.modal-container.large {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  line-height: 1;
}

.modal-body {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.editor-container {
  height: 100%;
  width: 100%;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-primary {
  background: #1976d2;
  color: white;
}
</style>
