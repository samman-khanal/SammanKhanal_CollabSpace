import { api } from "../api/axios";
export type WorkspaceRole = "owner" | "admin" | "member" | "viewer" | string;
export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  myRole?: WorkspaceRole;
  memberCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
export interface CreateWorkspaceInput {
  name: string;
  description?: string;
}
const workspaceService = {
  //* Method for workspace service
  async listMine(): Promise<Workspace[]> {
    const {
      data
    } = await api.get<Workspace[]>("/workspaces");
    return data;
  },
  //* Method for workspace service
  async getById(workspaceId: string): Promise<Workspace> {
    const {
      data
    } = await api.get<Workspace>(`/workspaces/${workspaceId}`);
    return data;
  },
  //* Method for workspace service
  async create(input: CreateWorkspaceInput): Promise<Workspace> {
    const payload = {
      name: input.name.trim(),
      description: input.description?.trim()
    };
    const {
      data
    } = await api.post<Workspace>("/workspaces", payload);
    return data;
  },
  //* Method for workspace service
  async update(workspaceId: string, patch: {
    name?: string;
    description?: string;
  }): Promise<Workspace> {
    const {
      data
    } = await api.patch<Workspace>(`/workspaces/${workspaceId}`, patch);
    return data;
  },
  //* Method for workspace service
  async remove(workspaceId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}`);
  }
};
export default workspaceService;