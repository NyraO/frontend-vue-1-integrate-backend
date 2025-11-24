<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h3>Add {{ nodeType }}</h3>
      
      <div class="form-group">
        <label>Name</label>
        <input v-model="formData.name" type="text" placeholder="Unique Name" />
      </div>

      <div class="form-group">
        <label>Description</label>
        <input v-model="formData.description" type="text" placeholder="Description" />
      </div>

      <div v-if="nodeType === 'input' || nodeType === 'output'">
        <div class="form-group">
          <label>Topic</label>
          <input v-model="formData.topic" type="text" placeholder="Kafka Topic" />
        </div>
        <div class="form-group">
          <label>Broker Address</label>
          <input v-model="formData.broker_address" type="text" placeholder="localhost:9092" />
        </div>
      </div>

      <div v-if="nodeType === 'transformation'">
        <div class="form-group">
          <label>Initial Python Script</label>
          <textarea v-model="formData.python_script" rows="4" placeholder="def transform(data): return data"></textarea>
        </div>
      </div>

      <div class="actions">
        <button @click="emit('close')">Cancel</button>
        <button class="primary" @click="handleSave">Create</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const props = defineProps<{ nodeType: 'input' | 'output' | 'transformation' }>()
const emit = defineEmits(['close', 'save'])

const formData = reactive({
  name: '',
  description: '',
  topic: '',
  broker_address: 'localhost:19092',
  python_script: 'def transform(data):\n    return data'
})

function handleSave() {
  if (!formData.name) return alert('Name is required')
  emit('save', { ...formData })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content {
  background: white; padding: 20px; border-radius: 8px; width: 400px;
  display: flex; flex-direction: column; gap: 12px;
}
.form-group { display: flex; flex-direction: column; gap: 4px; }
input, textarea { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
.actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
button { padding: 6px 12px; cursor: pointer; }
button.primary { background: #2c3e50; color: white; border: none; }
</style>
