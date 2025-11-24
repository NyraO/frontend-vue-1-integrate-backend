// Core Types matching backend schemas

export type NodeType = 'input' | 'output' | 'transformation'

export interface Pipeline {
  pipeline_id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string | null
}

export interface PipelineCreate {
  name: string
  description?: string | null
}

export interface PipelineUpdate {
  name?: string | null
  description?: string | null
}

export interface Input {
  input_id: number
  name: string
  description: string
  topic: string
  schemas: Record<string, any> | null
  broker_address: string
  created_at: string
}

export interface InputCreate {
  name: string
  description: string
  topic: string
  schemas?: Record<string, any> | null
  broker_address: string
}

export interface InputUpdate {
  name?: string | null
  description?: string | null
  topic?: string | null
  schemas?: Record<string, any> | null
  broker_address?: string | null
}

export interface Output {
  output_id: number
  name: string
  description: string | null
  topic: string
  schemas: Record<string, any> | null
  broker_address: string
  created_at: string
  updated_at: string | null
}

export interface OutputCreate {
  name: string
  description?: string | null
  topic: string
  schemas?: Record<string, any> | null
  broker_address: string
}

export interface OutputUpdate {
  name?: string | null
  description?: string | null
  topic?: string | null
  schemas?: Record<string, any> | null
  broker_address?: string | null
}

export interface Transformation {
  transformation_id: number
  name: string
  description: string | null
  schema_in: Record<string, any> | null
  schema_out: Record<string, any> | null
  python_script: string
  created_at: string
  updated_at: string | null
}

export interface TransformationCreate {
  name: string
  description?: string | null
  schema_in?: Record<string, any> | null
  schema_out?: Record<string, any> | null
  python_script: string
}

export interface TransformationUpdate {
  name?: string | null
  description?: string | null
  schema_in?: Record<string, any> | null
  schema_out?: Record<string, any> | null
  python_script?: string | null
}

export interface Flow {
  flow_id: number
  start_node_type: NodeType
  end_node_type: NodeType
  start_node: number
  end_node: number
  created_at: string
  updated_at: string | null
}

export interface FlowCreate {
  start_node_type: NodeType
  end_node_type: NodeType
  start_node: number
  end_node: number
}

export interface FlowUpdate {
  start_node_type?: NodeType | null
  end_node_type?: NodeType | null
  start_node?: number | null
  end_node?: number | null
}

export interface Tag {
  tag_id: number
  name: string
  created_at: string
  updated_at: string | null
}

export interface TagCreate {
  name: string
}

export interface ExecutionResponse {
  message: string
  pipeline_id: number
  status?: string | null
}

export interface StatusResponse {
  pipeline_id: number
  status: string
  uptime: string
  details?: any | null
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  pipeline_name?: string
}
