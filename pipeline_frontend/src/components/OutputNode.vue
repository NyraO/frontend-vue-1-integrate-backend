<template>
  <div class="custom-node output-node">
    <div class="label">{{ data.label }}</div>

    <!-- Send output to top only -->
    <Handle
      id="in"
      type="target"
      :position="Position.Top"
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
.output-node {
  padding: 10px 14px;
  background: #fff8e1;
  border-radius: 6px;
  border: 1px solid #ffecb3;
  pointer-events: all; 
  cursor: pointer;
}
.label {
  font-weight: 600;
}
</style>