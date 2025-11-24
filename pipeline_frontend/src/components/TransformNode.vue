<template>
  <div class="custom-node transform-node">
    <div class="header">TRANSFORM</div>
    <div class="label">{{ data.label }}</div>
    
    <Handle id="in" type="target" :position="Position.Top" :connectable="true" />
    <Handle id="out" type="source" :position="Position.Bottom" :connectable="true" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
defineProps<{ data: { label: string } }>()
</script>

<style scoped>
.transform-node {
  padding: 8px 12px; background: #e8f5e9; border-radius: 6px;
  border: 1px solid #a5d6a7; min-width: 120px; text-align: center;
}
.header { font-size: 10px; color: #2e7d32; font-weight: bold; margin-bottom: 4px; }
.label { font-weight: 600; font-size: 14px; }
</style>
