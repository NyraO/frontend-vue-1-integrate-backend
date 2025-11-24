<template>
  <div class="custom-node input-node">
    <div class="label">{{ data.label }}</div>

    <!-- Accept input from bottom only -->
    <Handle
      id="out"
      type="source"
      :position="Position.Bottom"
      :connectable="true"
    />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  id: string
  data: { label: string }
}>()
</script>

<style scoped>
.input-node {
  padding: 10px 14px;
  background: #e3f2fd;
  border-radius: 6px;
  border: 1px solid #90caf9;
  pointer-events: all; 
  cursor: pointer; 
}
.label {
  font-weight: 600;
}
</style>