<template>
  <BaseModal
    :show="show"
    :title="isEdit ? 'Edit Transform Node' : 'Create Transform Node'"
    :confirmText="isEdit ? 'Update' : 'Create'"
    @close="$emit('close')"
    @confirm="handleSubmit"
  >
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="name">Name *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="e.g., Data Cleaner"
        />
      </div>
      
      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          placeholder="Describe the transformation..."
          rows="2"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="script">Python Script *</label>
        <textarea
          id="script"
          v-model="form.python_script"
          required
          placeholder="def transform(data):
    # Your transformation logic
    return data"
          rows="8"
          class="code-input"
        ></textarea>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import type { TransformationCreate } from '@/services/types'

const props = defineProps<{
  show: boolean
  isEdit?: boolean
  initialData?: Partial<TransformationCreate>
}>()

const emit = defineEmits(['close', 'submit'])

const defaultScript = `def transform(data):
    # Your transformation logic here
    return data`

const form = ref<TransformationCreate>({
  name: '',
  description: '',
  python_script: defaultScript,
  schema_in: null,
  schema_out: null
})

watch(() => props.show, (newVal) => {
  if (newVal && props.initialData) {
    form.value = { ...form.value, ...props.initialData }
  } else if (newVal) {
    form.value = {
      name: '',
      description: '',
      python_script: defaultScript,
      schema_in: null,
      schema_out: null
    }
  }
})

function handleSubmit() {
  if (!form.value.name || !form.value.python_script) {
    alert('Please fill all required fields')
    return
  }
  emit('submit', { ...form.value })
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1976d2;
}

.code-input {
  font-family: 'Consolas', 'Monaco', monospace;
  background: #f8f9fa;
  font-size: 13px;
}
</style>
