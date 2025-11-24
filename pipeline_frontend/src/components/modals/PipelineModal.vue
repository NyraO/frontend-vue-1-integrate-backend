<template>
  <BaseModal
    :show="show"
    title="Create New Pipeline"
    confirmText="Create"
    @close="$emit('close')"
    @confirm="handleSubmit"
  >
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="name">Pipeline Name *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="e.g., User Analytics Pipeline"
        />
      </div>
      
      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          placeholder="Describe what this pipeline does..."
          rows="3"
        ></textarea>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import type { PipelineCreate } from '@/services/types'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close', 'submit'])

const form = ref<PipelineCreate>({
  name: '',
  description: ''
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    form.value = { name: '', description: '' }
  }
})

function handleSubmit() {
  if (!form.value.name) {
    alert('Pipeline name is required')
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
</style>
