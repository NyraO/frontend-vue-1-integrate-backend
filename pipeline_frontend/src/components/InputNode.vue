<template>
  <div class="custom-node input-node">
    <div class="header">INPUT</div>
    <div class="label">{{ data.label }}</div>
    <div class="sub">{{ data.topic }}</div>
    
    <Handle id="out" type="source" :position="Position.Bottom" :connectable="true" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
defineProps<{ data: { label: string, topic: string } }>()
</script>

<style scoped>
.input-node {
  padding: 8px 12px; background: #e3f2fd; border-radius: 6px;
  border: 1px solid #90caf9; min-width: 120px; text-align: center;
}
.header { font-size: 10px; color: #1565c0; font-weight: bold; margin-bottom: 4px; }
.label { font-weight: 600; font-size: 14px; }
.sub { font-size: 11px; color: #555; }
</style>
