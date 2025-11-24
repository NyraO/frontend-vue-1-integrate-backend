<template>
  <div class="container">
    <!-- LEFT: Pipeline Builder -->
    <div class="left-pane">
      <div class="top-bar">
        <select v-model="newNodeType">
          <option value="inputNode">Input Node</option>
          <option value="transformNode">Transform Node</option>
          <option value="outputNode">Output Node</option>
        </select>
        <button @click="addNode">Add Node</button>
      </div>

      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :node-types="nodeTypes"
        :default-edge-options="defaultEdgeOptions"
        :nodes-draggable="true"
        :nodes-connectable="true"
        :edges-updatable="true"
        :nodes-selectable="true"
        :edges-selectable="true"
        :allow-multiple-source-connections="true"
        :allow-multiple-target-connections="true"
        :connection-mode="ConnectionMode.Loose"
        fit-view-on-init
        @connect="onConnect"
        @element-click="onElementClick"
        class="vueflow-wrapper"
      >
        <MiniMap />
        <Controls />
      </VueFlow>
    </div>

    <!-- RIGHT: Node Editor with Monaco -->
    <div class="right-pane">
      <h3>Node ID: {{ selectedNode?.id ?? '-' }}</h3>
      <monaco-editor
        v-model="nodeCode"
        language="python"
        :options="editorOptions"
      />
      <button
        @click="saveNodeCode"
        :disabled="!selectedNode"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, markRaw, watch } from 'vue'
import {
  VueFlow,
  useVueFlow,
  ConnectionMode,
  type Connection,
  type Edge,
  type NodeComponent,
  type Node
} from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'

import InputNode from './components/InputNode.vue'
import TransformNode from './components/TransformNode.vue'
import OutputNode from './components/OutputNode.vue'

import MonacoEditor from 'monaco-editor-vue3'

// ---------------------------
// Node Types
// ---------------------------
const nodeTypes = {
  inputNode: markRaw(InputNode),
  transformNode: markRaw(TransformNode),
  outputNode: markRaw(OutputNode)
} as unknown as Record<string, NodeComponent>

// ---------------------------
// Nodes & Edges
// ---------------------------
const nodes = ref<Node[]>([
  {
    id: 'input-1',
    type: 'inputNode',
    position: { x: 100, y: 50 },
    data: { label: 'Input Node', handles: { out: 'source' }, code: '// Input Node code' }
  }
])
const edges = ref<Edge[]>([])

const { addEdges } = useVueFlow()
const defaultEdgeOptions = { markerEnd: 'arrow' }

// ---------------------------
// Selected Node / Editor
// ---------------------------
const selectedElement = ref<Node | Edge | null>(null)
const selectedNode = computed(() => (selectedElement.value && 'data' in selectedElement.value ? selectedElement.value as Node : null))
const nodeCode = ref('')

// Monaco editor options
const editorOptions = {
  automaticLayout: true,
  fontSize: 14,
  minimap: { enabled: false }
}

// Update editor when node selection changes
watch(selectedNode, (val) => {
  nodeCode.value = val?.data.code ?? ''
})

// ---------------------------
// Handle Element Click
// ---------------------------
function onElementClick(event: MouseEvent, element: Node | Edge) {
  selectedElement.value = element
  if ('data' in element) {
    nodeCode.value = element.data.code ?? ''
  }
  console.log('Selected element:', element)
}

// ---------------------------
// Add Node
// ---------------------------
const newNodeType = ref<'inputNode' | 'transformNode' | 'outputNode'>('inputNode')
let nodeIdCounter = 2

function addNode() {
  const id = `${newNodeType.value}-${nodeIdCounter++}`
  const newNode: Node = {
    id,
    type: newNodeType.value,
    position: { x: 200, y: 200 },
    data: {
      label: `${newNodeType.value} ${nodeIdCounter-1}`,
      code: `// ${newNodeType.value} code`,
      handles: (() => {
        if (newNodeType.value === 'inputNode') return { out: 'source' }
        if (newNodeType.value === 'outputNode') return { in: 'target' }
        return { in: 'target', out: 'source' }
      })()
    }
  }
  nodes.value.push(newNode)
}

// ---------------------------
// Connect Nodes
// ---------------------------
function onConnect(connection: Connection) {
  const sourceNode = nodes.value.find(n => n.id === connection.source)
  const targetNode = nodes.value.find(n => n.id === connection.target)
  console.log('sourceNode', sourceNode?.type, 'targetNode', targetNode?.type)

  if (!sourceNode || !targetNode) return

  // Get handle types
  const sourceHandleType = connection.sourceHandle != null ? (sourceNode.data.handles as Record<string, string>)?.[connection.sourceHandle] : undefined
  const targetHandleType = connection.targetHandle != null ? (targetNode.data.handles as Record<string, string>)?.[connection.targetHandle] : undefined
  console.log('sourceHandleType', sourceHandleType, 'targetHandleType', targetHandleType)
  
  // Invalid if source handle is not 'source' or target handle is not 'target'
  if (sourceHandleType !== 'source' || targetHandleType !== 'target') {
    alert('Invalid connection! Handles are incompatible.')
    return
  }

   // Validation rules
  const invalid =
    (sourceNode.type === 'inputNode' && targetNode.type === 'outputNode') ||
    (sourceNode.type === 'outputNode' && targetNode.type === 'inputNode') ||
    (sourceNode.type === 'transformNode' && targetNode.type === 'inputNode') ||
    (sourceNode.type === 'outputNode' && targetNode.type === 'transformNode')

  if (invalid) {
    alert('Invalid connection!')
    return
  }

  // Add edge if valid
  addEdges([connection])
}

// ---------------------------
// Save Node Code
// ---------------------------
function saveNodeCode() {
  if (!selectedNode.value) return
  selectedNode.value.data.code = nodeCode.value
  alert('Code saved!')
}

// ---------------------------
// Delete Node / Edge
// ---------------------------
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Delete' && selectedElement.value) {
    const element = selectedElement.value
    if ('source' in element && 'target' in element) {
      edges.value = edges.value.filter(e => e.id !== element.id)
    } else {
      nodes.value = nodes.value.filter(n => n.id !== element.id)
      edges.value = edges.value.filter(e => e.source !== element.id && e.target !== element.id)
    }
    selectedElement.value = null
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
}

.left-pane {
  flex: 2;
  position: relative;
  border-right: 1px solid #ddd;
}

.top-bar {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  display: flex;
  gap: 8px;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 0 4px rgba(0,0,0,0.2);
}

.vueflow-wrapper {
  width: 100%;
  height: 100%;
}

.right-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #f4f4f4;
}

button {
  padding: 6px 12px;
  cursor: pointer;
  margin-top: 8px;
}
</style>
