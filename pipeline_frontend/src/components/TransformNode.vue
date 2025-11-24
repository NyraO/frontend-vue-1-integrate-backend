<template>
  <div class="custom-node transform-node">
    <div class="label">{{ data.label }}</div>

    <!-- Top input -->
    <Handle
      id="in"
      type="target"
      :position="Position.Top"
      :connectable="true"
    />

    <!-- Bottom output -->
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
.transform-node {
  padding: 10px 14px;
  background: #e8f5e9;
  border-radius: 6px;
  border: 1px solid #a5d6a7;
  pointer-events: all; 
  cursor: pointer;
}
.label {
  font-weight: 600;
}
</style>