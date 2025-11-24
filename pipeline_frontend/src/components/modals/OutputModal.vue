<template>
  <BaseModal
    :show="show"
    :title="isEdit ? 'Edit Output Node' : 'Create Output Node'"
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
          placeholder="e.g., Processed Events Output"
        />
      </div>
      
      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          placeholder="Describe the output destination..."
          rows="2"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="topic">Kafka Topic *</label>
        <input
          id="topic"
          v-model="form.topic"
          type="text"
          required
          placeholder="e.g., processed-events"
        />
      </div>
      
      <div class="form-group">
        <label for="broker">Broker Address *</label>
        <input
          id="broker"
          v-model="form.broker_address"
          type="text"
          required
          placeholder="e.g., localhost:9092"
        />
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import type { OutputCreate } from '@/services/types'

const props = defineProps<{
  show: boolean
  isEdit?: boolean
  initialData?: Partial<OutputCreate>
}>()

const emit = defineEmits(['close', 'submit'])

const form = ref<OutputCreate>({
  name: '',
  description: '',
  topic: '',
  broker_address: 'localhost:9092',
  schemas: null
})

watch(() => props.show, (newVal) => {
  if (newVal && props.initialData) {
    form.value = { ...form.value, ...props.initialData }
  } else if (newVal) {
    form.value = {
      name: '',
      description: '',
      topic: '',
      broker_address: 'localhost:9092',
      schemas: null
    }
  }
})

function handleSubmit() {
  if (!form.value.name || !form.value.topic || !form.value.broker_address) {
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
</style>
