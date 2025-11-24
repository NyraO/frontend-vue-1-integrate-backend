<template>
  <div class="custom-node output-node">
    <div class="header">OUTPUT</div>
    <div class="label">{{ data.label }}</div>
    <div class="sub">{{ data.topic }}</div>

    <Handle id="in" type="target" :position="Position.Top" :connectable="true" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
defineProps<{ data: { label: string, topic: string } }>()
</script>

<style scoped>
.output-node {
  padding: 8px 12px; background: #fff8e1; border-radius: 6px;
  border: 1px solid #ffecb3; min-width: 120px; text-align: center;
}
.header { font-size: 10px; color: #f57f17; font-weight: bold; margin-bottom: 4px; }
.label { font-weight: 600; font-size: 14px; }
.sub { font-size: 11px; color: #555; }
</style>
