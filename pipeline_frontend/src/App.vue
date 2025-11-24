
<template>
  <div class="container">
    <div class="left-pane">
      
      <div class="top-bar">
        
        <div class="control-group">
          <label class="group-label">Pipeline:</label>
          <select v-model="currentPipelineId" @change="onPipelineChange" class="pipeline-select">
            <option v-for="p in pipelines" :key="p.pipeline_id" :value="p.pipeline_id">
              {{ p.name }}
            </option>
          </select>
          <button @click="createNewPipeline" title="Create New Pipeline" class="icon-btn">+</button>
        </div>

        <div class="divider"></div>

        <div class="control-group">
          <select v-model="newNodeType">
            <option value="input">Input Node</option>
            <option value="transformation">Transform Node</option>
            <option value="output">Output Node</option>
          </select>
          <button @click="triggerAddNode">Add Node</button>
        </div>

        <div class="divider"></div>

        <div class="control-group">
          <button @click="validatePipeline" class="action-btn">Validate</button>
          <button @click="startPipeline" class="action-btn run-btn" :disabled="pipelineStatus === 'running'">Start</button>
          <button @click="stopPipeline" class="action-btn stop-btn" :disabled="pipelineStatus !== 'running'">Stop</button>
        </div>

        <div class="status-badge" :class="statusClass">
          {{ statusText }}
        </div>
      </div>

      <div v-if="startMessage" class="run-instruction">
        <span>✅ {{ startMessage }}</span>
        <button class="close-msg" @click="startMessage = ''">×</button>
      </div>

      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :node-types="nodeTypes"
        :default-edge-options="{ markerEnd: 'arrow', type: 'smoothstep', style: { strokeWidth: 2 } }"
        :connection-mode="ConnectionMode.Loose"
        fit-view-on-init
        @connect="onConnect"
        @node-click="onNodeClick"
        @edge-click="onEdgeClick"
        @pane-click="clearSelection"
        class="vueflow-wrapper"
      >
        <MiniMap />
        <Controls />
      </VueFlow>
    </div>

    <div class="right-pane" v-if="selectedNodeId">
      <div class="editor-header">
        <h3>Edit {{ selectedNodeData.type?.toUpperCase() }}</h3>
        <div class="header-actions">
           <button class="delete-btn" @click="deleteNode">Delete</button>
           <button class="save-btn" @click="saveNodeChanges" :disabled="isSaving">
             {{ isSaving ? 'Saving...' : 'Save' }}
           </button>
        </div>
      </div>

      <div class="editor-content">
        <div class="form-group">
          <label>Name</label>
          <input v-model="editForm.name" type="text" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <input v-model="editForm.description" type="text" />
        </div>

        <div v-if="selectedNodeData.type === 'input' || selectedNodeData.type === 'output'">
          <div class="form-group">
            <label>Kafka Topic</label>
            <input v-model="editForm.topic" type="text" />
          </div>
          <div class="form-group">
            <label>Broker Address</label>
            <input v-model="editForm.broker_address" type="text" />
          </div>
        </div>

        <div v-if="selectedNodeData.type === 'transformation'" class="code-group">
          <label>Python Code</label>
          <div class="monaco-wrapper">
            <monaco-editor
              :key="selectedNodeId"
              v-model:value="editForm.python_script"
              language="python"
              theme="vs-dark"
              :options="editorOptions"
            />
          </div>
        </div>
      </div>
    </div>
    
    <div class="right-pane" v-else-if="selectedEdgeId">
       <div class="editor-header">
        <h3>Connection</h3>
        <div class="header-actions">
           <button class="delete-btn" @click="deleteEdge">Delete Link</button>
        </div>
      </div>
      <div class="editor-content">
        <p class="info-text">Selected Flow ID: {{ selectedEdgeId }}</p>
        <p class="info-text">Click 'Delete Link' above to remove this connection.</p>
      </div>
    </div>

    <div class="right-pane empty" v-else>
      <p>Select a node or link to edit.</p>
    </div>

    <NodeModal 
      v-if="isModalOpen" 
      :nodeType="modalType" 
      @close="isModalOpen = false" 
      @save="handleCreateNode" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, markRaw } from 'vue'
import { VueFlow, useVueFlow, ConnectionMode, type Connection, type Node, type Edge, type EdgeMouseEvent } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import MonacoEditor from 'monaco-editor-vue3'

import InputNode from './components/InputNode.vue'
import TransformNode from './components/TransformNode.vue'
import OutputNode from './components/OutputNode.vue'
import NodeModal from './components/NodeModal.vue'

import { pipelineService } from '@/services/pipelineService'
import type { NodeType, Pipeline } from '@/services/types'

// --- Setup Vue Flow ---
const { addEdges, removeNodes, removeEdges } = useVueFlow()

const nodeTypes = {
  input: markRaw(InputNode),
  transformation: markRaw(TransformNode),
  output: markRaw(OutputNode)
}

// --- State ---
const pipelines = ref<Pipeline[]>([])
const currentPipelineId = ref<number | null>(null)
const newNodeType = ref<'input' | 'transformation' | 'output'>('input')

// Graph
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

// Editor / Selection
const selectedNodeId = ref<string | null>(null)
const selectedNodeData = ref<any>(null)
const selectedEdgeId = ref<string | null>(null)

const editForm = ref({
  name: '',
  description: '',
  topic: '',
  broker_address: '',
  python_script: ''
})

// Status & Polling
const pipelineStatus = ref<string>('stopped')
const uptime = ref<string>('0s')
const statusMessage = ref('')
const startMessage = ref('') 
const isSaving = ref(false)
let pollInterval: number | null = null

// Modal
const isModalOpen = ref(false)
const modalType = ref<'input' | 'output' | 'transformation'>('input')

const editorOptions = { 
  automaticLayout: true, 
  fontSize: 13, 
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: 'on'
}

// --- Computed ---
const statusClass = computed(() => {
  if (statusMessage.value.includes('Error') || statusMessage.value.includes('Failed')) return 'error'
  if (pipelineStatus.value === 'running') return 'success'
  return ''
})

const statusText = computed(() => {
  if (statusMessage.value) return statusMessage.value
  if (pipelineStatus.value === 'running') return `Running (Up: ${uptime.value})`
  return 'Stopped'
})

// --- Lifecycle ---
onMounted(async () => {
  await loadPipelines()
  pollInterval = setInterval(checkStatus, 2000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

// --- Pipeline Loading ---
async function loadPipelines() {
  try {
    const list = await pipelineService.listPipelines(0, 100)
    pipelines.value = list
    if (list.length > 0 && !currentPipelineId.value) {
      currentPipelineId.value = list[0].pipeline_id
    } else if (list.length === 0) {
      await createNewPipeline(false)
    }
    if (currentPipelineId.value) await refreshGraph()
  } catch (e) {
    handleError(e, 'Failed to load pipelines')
  }
}

function onPipelineChange() {
  clearSelection()
  refreshGraph()
  startMessage.value = ''
  statusMessage.value = ''
}

async function createNewPipeline(promptUser = true) {
  let name = 'New Pipeline'
  if (promptUser) {
    const userInput = window.prompt("Enter Pipeline Name:")
    if (!userInput) return
    name = userInput
  }
  try {
    const newP = await pipelineService.createPipeline({ name, description: 'Created via UI' })
    pipelines.value.push(newP)
    currentPipelineId.value = newP.pipeline_id
    await refreshGraph()
  } catch (e) {
    handleError(e, 'Creation Failed')
  }
}

// --- Graph Data ---
async function refreshGraph() {
  if (!currentPipelineId.value) return
  const pid = currentPipelineId.value
  nodes.value = []
  edges.value = []

  try {
    const [inputs, outputs, transforms, flows] = await Promise.all([
      pipelineService.listInputs(pid),
      pipelineService.listOutputs(pid),
      pipelineService.listTransformations(pid),
      pipelineService.listFlows(pid)
    ])

    inputs.forEach((i, idx) => {
      nodes.value.push({
        id: `input-${i.input_id}`, type: 'input',
        position: { x: 100, y: 100 + (idx * 150) },
        data: { label: i.name, topic: i.topic, dbId: i.input_id, type: 'input', ...i }
      })
    })

    transforms.forEach((t, idx) => {
      nodes.value.push({
        id: `transformation-${t.transformation_id}`, type: 'transformation',
        position: { x: 500, y: 100 + (idx * 150) },
        data: { label: t.name, code: t.python_script, dbId: t.transformation_id, type: 'transformation', ...t }
      })
    })

    outputs.forEach((o, idx) => {
      nodes.value.push({
        id: `output-${o.output_id}`, type: 'output',
        position: { x: 900, y: 100 + (idx * 150) },
        data: { label: o.name, topic: o.topic, dbId: o.output_id, type: 'output', ...o }
      })
    })

    flows.forEach(f => {
      edges.value.push({
        id: `flow-${f.flow_id}`,
        source: `${f.start_node_type}-${f.start_node}`,
        target: `${f.end_node_type}-${f.end_node}`,
        animated: true,
        style: { stroke: '#2c3e50', strokeWidth: 2 }
      })
    })
  } catch (e) {
    handleError(e, 'Graph refresh failed')
  }
}

// --- Polling ---
async function checkStatus() {
  if (!currentPipelineId.value) return
  try {
    const res = await pipelineService.getPipelineStatus(currentPipelineId.value)
    pipelineStatus.value = res.status
    uptime.value = res.uptime || '0s'
    if (res.status === 'running' && statusMessage.value.includes('Error')) {
      statusMessage.value = ''
    }
  } catch (e) {
    // Silent fail for polling
  }
}

// --- Selection & Editing ---

// 1. NODE CLICK
function onNodeClick(e: { node: Node }) {
  selectedEdgeId.value = null
  selectedNodeId.value = e.node.id
  selectedNodeData.value = e.node.data
  
  // Reset Form
  editForm.value = {
    name: e.node.data.name || '',
    description: e.node.data.description || '',
    topic: '',
    broker_address: '',
    python_script: ''
  }
  
  if (e.node.type === 'input' || e.node.type === 'output') {
    editForm.value.topic = e.node.data.topic || ''
    editForm.value.broker_address = e.node.data.broker_address || ''
  } else if (e.node.type === 'transformation') {
    // Ensure we capture the script correctly from data
    editForm.value.python_script = e.node.data.python_script || e.node.data.code || ''
  }
}

// 2. EDGE CLICK (Link Selection)
function onEdgeClick(e: EdgeMouseEvent) {
  selectedNodeId.value = null
  selectedNodeData.value = null
  selectedEdgeId.value = e.edge.id
}

function clearSelection() {
  selectedNodeId.value = null
  selectedNodeData.value = null
  selectedEdgeId.value = null
}

async function saveNodeChanges() {
  if (!currentPipelineId.value || !selectedNodeId.value) return
  isSaving.value = true
  const dbId = selectedNodeData.value.dbId
  const type = selectedNodeData.value.type
  const pid = currentPipelineId.value

  try {
    if (type === 'input') {
      await pipelineService.updateInput(pid, dbId, {
        name: editForm.value.name,
        description: editForm.value.description,
        topic: editForm.value.topic,
        broker_address: editForm.value.broker_address
      })
    } else if (type === 'output') {
      await pipelineService.updateOutput(pid, dbId, {
        name: editForm.value.name,
        description: editForm.value.description,
        topic: editForm.value.topic,
        broker_address: editForm.value.broker_address
      })
    } else if (type === 'transformation') {
      await pipelineService.updateTransformation(pid, dbId, {
        name: editForm.value.name,
        description: editForm.value.description,
        python_script: editForm.value.python_script
      })
    }
    
    await refreshGraph()
    // Restore selection data
    const node = nodes.value.find(n => n.id === selectedNodeId.value)
    if (node) {
        selectedNodeData.value = node.data
    }
    
    statusMessage.value = 'Saved Changes'
    setTimeout(() => statusMessage.value = '', 2000)
  } catch (e) {
    handleError(e, 'Save Failed')
  } finally {
    isSaving.value = false
  }
}

async function deleteNode() {
  if (!confirm('Are you sure you want to delete this node?')) return
  if (!currentPipelineId.value || !selectedNodeId.value) return
  
  const dbId = selectedNodeData.value.dbId
  const type = selectedNodeData.value.type
  const pid = currentPipelineId.value

  try {
    if (type === 'input') await pipelineService.deleteInput(pid, dbId)
    else if (type === 'output') await pipelineService.deleteOutput(pid, dbId)
    else if (type === 'transformation') await pipelineService.deleteTransformation(pid, dbId)
    
    removeNodes([selectedNodeId.value])
    clearSelection()
    statusMessage.value = 'Node Deleted'
    setTimeout(() => statusMessage.value = '', 2000)
  } catch (e) {
    handleError(e, 'Delete Failed')
  }
}

// 3. DELETE EDGE Logic
async function deleteEdge() {
  if (!selectedEdgeId.value || !currentPipelineId.value) return
  if (!confirm('Are you sure you want to delete this connection?')) return

  // ID format: "flow-{id}"
  const flowIdStr = selectedEdgeId.value.split('-')[1]
  const flowId = parseInt(flowIdStr)

  try {
    await pipelineService.deleteFlow(currentPipelineId.value, flowId)
    removeEdges([selectedEdgeId.value])
    clearSelection()
    statusMessage.value = 'Link Removed'
    setTimeout(() => statusMessage.value = '', 2000)
  } catch (e) {
    handleError(e, 'Failed to delete link')
  }
}

// --- Node Creation ---
function triggerAddNode() {
  modalType.value = newNodeType.value
  isModalOpen.value = true
}

async function handleCreateNode(data: any) {
  if (!currentPipelineId.value) return
  const pid = currentPipelineId.value
  isModalOpen.value = false

  try {
    if (modalType.value === 'input') {
      await pipelineService.createInput(pid, { ...data })
    } else if (modalType.value === 'output') {
      await pipelineService.createOutput(pid, { ...data })
    } else {
      await pipelineService.createTransformation(pid, { ...data })
    }
    await refreshGraph()
  } catch (e) {
    handleError(e, 'Create Failed')
  }
}

// --- Connections ---
async function onConnect(params: Connection) {
  if (!currentPipelineId.value || !params.source || !params.target) return
  const [srcType, srcId] = params.source.split('-')
  const [tgtType, tgtId] = params.target.split('-')

  if (srcType === 'output' || tgtType === 'input') {
    return alert('Invalid Connection: Output cannot connect to Input')
  }

  try {
    await pipelineService.createFlow(currentPipelineId.value, {
      start_node_type: srcType as NodeType,
      start_node: parseInt(srcId),
      end_node_type: tgtType as NodeType,
      end_node: parseInt(tgtId)
    })
    // Refresh to get the valid flow ID
    await refreshGraph()
  } catch (e) {
    handleError(e, 'Connection Failed')
  }
}

// --- Execution ---
async function validatePipeline() {
  if (!currentPipelineId.value) return
  statusMessage.value = 'Validating...'
  try {
    const res = await pipelineService.validatePipeline(currentPipelineId.value)
    if (res.status === 'valid') {
       statusMessage.value = 'Validation Passed'
       setTimeout(() => statusMessage.value = '', 3000)
    } else {
       alert(`Validation Failed:\n${res.message}`)
       statusMessage.value = 'Validation Failed'
    }
  } catch (e) {
    handleError(e, 'Validation Error')
  }
}

async function startPipeline() {
  if (!currentPipelineId.value) return
  statusMessage.value = 'Starting...'
  startMessage.value = ''
  try {
    await pipelineService.startPipeline(currentPipelineId.value)
    checkStatus()
    startMessage.value = "Pipeline Started! Please verify data in your Broker/Output Topic."
  } catch (e) {
    handleError(e, 'Start Failed')
  }
}

async function stopPipeline() {
  if (!currentPipelineId.value) return
  try {
    await pipelineService.stopPipeline(currentPipelineId.value)
    checkStatus()
    startMessage.value = ''
  } catch (e) {
    handleError(e, 'Stop Failed')
  }
}

// --- Helper: Better Error Handling ---
function handleError(e: any, context: string) {
  console.error(context, e)
  let msg = 'Unknown Error'
  
  if (e.response && e.response.json) {
      e.response.json().then((d: any) => {
         msg = d.detail || JSON.stringify(d)
         alert(`${context}: ${msg}`)
         statusMessage.value = 'Error: ' + msg
      })
      return
  } 
  
  if (e.message) msg = e.message
  if (e.response && e.response.data && e.response.data.detail) {
     msg = e.response.data.detail
  }
  
  alert(`${context}: ${msg}`)
  statusMessage.value = 'Error: ' + msg
}
</script>

<style scoped>
.container { 
  display: flex; 
  height: 100vh; 
  width: 100vw; 
  overflow: hidden; 
}

/* LEFT PANE: Crucial for managing vertical space */
.left-pane { 
  flex: 3; 
  position: relative; 
  border-right: 1px solid #ddd; 
  display: flex; 
  flex-direction: column; 
  min-height: 0; 
  overflow: hidden; /* Added: Ensures no vertical content bleed */
}

/* VUEFLOW WRAPPER: Takes all remaining vertical space */
.vueflow-wrapper { 
  flex: 1; 
  background: #f8f9fa; 
  min-height: 0; 
}

/* TOP BAR */
.top-bar {
  padding: 8px 16px; 
  background: white; 
  border-bottom: 1px solid #eee;
  display: flex; 
  align-items: center; 
  gap: 16px; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
  z-index: 10;
  flex-shrink: 0; 
}
.control-group { display: flex; align-items: center; gap: 8px; }
.group-label { font-size: 13px; font-weight: 600; color: #555; }
.pipeline-select { padding: 6px; border: 1px solid #ccc; border-radius: 4px; min-width: 150px; }
select { padding: 6px; border: 1px solid #ccc; border-radius: 4px; }
.divider { width: 1px; height: 24px; background: #ddd; }
button { padding: 6px 12px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
button:hover { background: #f5f5f5; }
.icon-btn { padding: 6px 10px; font-weight: bold; }
.action-btn { font-weight: 500; }
.run-btn { background: #e8f5e9; border-color: #a5d6a7; color: #1b5e20; }
.run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.stop-btn { background: #ffebee; border-color: #ef9a9a; color: #b71c1c; }
.stop-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.status-badge { margin-left: auto; padding: 4px 10px; border-radius: 12px; font-size: 12px; background: #eee; font-weight: 600; }
.status-badge.success { background: #c8e6c9; color: #2e7d32; }
.status-badge.error { background: #ffcdd2; color: #c62828; }

/* RUN INSTRUCTION */
.run-instruction {
  background: #e8f5e9; border-bottom: 1px solid #a5d6a7; color: #1b5e20;
  padding: 10px 16px; font-size: 14px; font-weight: 500; display: flex; justify-content: space-between; align-items: center;
}
.close-msg { background: none; border: none; font-size: 18px; color: #1b5e20; cursor: pointer; padding: 0 4px; }

/* RIGHT PANE */
.right-pane { 
  flex: 2; 
  display: flex; 
  flex-direction: column; 
  background: #1e1e1e; 
  border-left: 1px solid #333; 
  color: #ccc; 
  min-height: 0; 
  overflow: hidden; /* Added: Ensures no vertical content bleed */
}
.right-pane.empty { background: #f4f4f4; align-items: center; justify-content: center; color: #666; }

.editor-header {
  padding: 10px 16px; 
  background: #252526; 
  border-bottom: 1px solid #333;
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  flex-shrink: 0; /* Ensures header doesn't shrink vertically */
}

/* FIX: Ensure the header text doesn't push action buttons out horizontally */
.editor-header h3 {
  margin: 0;
  white-space: nowrap; /* Prevent title wrap */
  overflow: hidden; /* Truncate text if necessary */
  text-overflow: ellipsis; 
  max-width: 60%; /* Allow action buttons to take necessary space */
}

.header-actions { 
  display: flex; 
  gap: 8px; 
  flex-shrink: 0; /* Crucial: Prevents buttons from collapsing */
}
.save-btn { background: #0e639c; color: white; border: none; }
.delete-btn { background: #a12626; color: white; border: none; }

.editor-content { 
  padding: 16px; 
  display: flex; 
  flex-direction: column; 
  gap: 16px; 
  flex: 1; 
  overflow-y: auto; 
}

.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group label { font-size: 12px; font-weight: bold; color: #888; }
.form-group input { 
  padding: 8px; 
  background: #3c3c3c; 
  border: 1px solid #444; 
  color: white; 
  border-radius: 4px; 
}
.code-group { display: flex; flex-direction: column; gap: 4px; }

/* FIX: Monaco Editor rendering fix. Explicitly set height */
.monaco-wrapper { 
  height: 500px; 
  width: 100%; 
  border: 1px solid #444; 
  display: block;
}

.info-text { font-size: 14px; color: #888; margin-bottom: 8px; }
</style>