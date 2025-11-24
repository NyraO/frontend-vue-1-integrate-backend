import { api } from './api'
import type {
  Pipeline,
  PipelineCreate,
  PipelineUpdate,
  Input,
  InputCreate,
  InputUpdate,
  Output,
  OutputCreate,
  OutputUpdate,
  Transformation,
  TransformationCreate,
  TransformationUpdate,
  Flow,
  FlowCreate,
  FlowUpdate,
  Tag,
  TagCreate,
  ExecutionResponse,
  StatusResponse,
} from './types'

export const pipelineService = {
  // Pipeline CRUD
  async listPipelines(skip = 0, limit = 100): Promise<Pipeline[]> {
    return api.get(`/pipeline?skip=${skip}&limit=${limit}`)
  },

  async getPipeline(pipelineId: number): Promise<Pipeline> {
    return api.get(`/pipeline/${pipelineId}`)
  },

  async createPipeline(data: PipelineCreate): Promise<Pipeline> {
    return api.post('/pipeline', data)
  },

  async updatePipeline(pipelineId: number, data: PipelineUpdate): Promise<Pipeline> {
    return api.put(`/pipeline/${pipelineId}`, data)
  },

  async deletePipeline(pipelineId: number): Promise<void> {
    return api.delete(`/pipeline/${pipelineId}`)
  },

  // Input operations
  async listInputs(pipelineId: number): Promise<Input[]> {
    return api.get(`/pipeline/${pipelineId}/input`)
  },

  async getInput(pipelineId: number, inputId: number): Promise<Input> {
    return api.get(`/pipeline/${pipelineId}/input/${inputId}`)
  },

  async createInput(pipelineId: number, data: InputCreate): Promise<Input> {
    return api.post(`/pipeline/${pipelineId}/input`, data)
  },

  async updateInput(pipelineId: number, inputId: number, data: InputUpdate): Promise<Input> {
    return api.put(`/pipeline/${pipelineId}/input/${inputId}`, data)
  },

  async deleteInput(pipelineId: number, inputId: number): Promise<void> {
    return api.delete(`/pipeline/${pipelineId}/input/${inputId}`)
  },

  // Output operations
  async listOutputs(pipelineId: number): Promise<Output[]> {
    return api.get(`/pipeline/${pipelineId}/output`)
  },

  async getOutput(pipelineId: number, outputId: number): Promise<Output> {
    return api.get(`/pipeline/${pipelineId}/output/${outputId}`)
  },

  async createOutput(pipelineId: number, data: OutputCreate): Promise<Output> {
    return api.post(`/pipeline/${pipelineId}/output`, data)
  },

  async updateOutput(pipelineId: number, outputId: number, data: OutputUpdate): Promise<Output> {
    return api.put(`/pipeline/${pipelineId}/output/${outputId}`, data)
  },

  async deleteOutput(pipelineId: number, outputId: number): Promise<void> {
    return api.delete(`/pipeline/${pipelineId}/output/${outputId}`)
  },

  // Transformation operations
  async listTransformations(pipelineId: number): Promise<Transformation[]> {
    return api.get(`/pipeline/${pipelineId}/transformation`)
  },

  async getTransformation(pipelineId: number, transformationId: number): Promise<Transformation> {
    return api.get(`/pipeline/${pipelineId}/transformation/${transformationId}`)
  },

  async createTransformation(
    pipelineId: number,
    data: TransformationCreate
  ): Promise<Transformation> {
    return api.post(`/pipeline/${pipelineId}/transformation`, data)
  },

  async updateTransformation(
    pipelineId: number,
    transformationId: number,
    data: TransformationUpdate
  ): Promise<Transformation> {
    return api.put(`/pipeline/${pipelineId}/transformation/${transformationId}`, data)
  },

  async deleteTransformation(pipelineId: number, transformationId: number): Promise<void> {
    return api.delete(`/pipeline/${pipelineId}/transformation/${transformationId}`)
  },

  // Flow operations
  async listFlows(pipelineId: number): Promise<Flow[]> {
    return api.get(`/pipeline/${pipelineId}/flow`)
  },

  async getFlow(pipelineId: number, flowId: number): Promise<Flow> {
    return api.get(`/pipeline/${pipelineId}/flow/${flowId}`)
  },

  async createFlow(pipelineId: number, data: FlowCreate): Promise<Flow> {
    return api.post(`/pipeline/${pipelineId}/flow`, data)
  },

  async updateFlow(pipelineId: number, flowId: number, data: FlowUpdate): Promise<Flow> {
    return api.put(`/pipeline/${pipelineId}/flow/${flowId}`, data)
  },

  async deleteFlow(pipelineId: number, flowId: number): Promise<void> {
    return api.delete(`/pipeline/${pipelineId}/flow/${flowId}`)
  },

  // Tag operations
  async listTags(pipelineId: number): Promise<Tag[]> {
    return api.get(`/pipeline/${pipelineId}/tag`)
  },

  async addTag(pipelineId: number, data: TagCreate): Promise<Tag> {
    return api.post(`/pipeline/${pipelineId}/tag`, data)
  },

  async removeTag(pipelineId: number, tagId: number): Promise<void> {
    return api.delete(`/pipeline/${pipelineId}/tag/${tagId}`)
  },

  // Execution operations
  async validatePipeline(pipelineId: number): Promise<ExecutionResponse> {
    return api.post(`/pipeline/${pipelineId}/validate`, {})
  },

  async startPipeline(pipelineId: number): Promise<ExecutionResponse> {
    return api.post(`/pipeline/${pipelineId}/start`, {})
  },

  async stopPipeline(pipelineId: number): Promise<ExecutionResponse> {
    return api.post(`/pipeline/${pipelineId}/stop`, {})
  },

  async getPipelineStatus(pipelineId: number): Promise<StatusResponse> {
    return api.get(`/pipeline/${pipelineId}/status`)
  },
}
