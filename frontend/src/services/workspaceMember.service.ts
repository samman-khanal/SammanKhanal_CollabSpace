import { api } from "../api/axios";
export interface WorkspaceMember {
  _id: string;
  workspace: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  role: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface WorkspaceInvite {
  _id: string;
  workspace: string;
  email: string;
  status: string;
  token?: string;
  createdAt?: string;
}
const workspaceMemberService = {
  //* Method for workspace member service
  async list(workspaceId: string): Promise<WorkspaceMember[]> {
    const {
      data
    } = await api.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
    return data;
  },
  //* Method for workspace member service
  async changeRole(workspaceId: string, memberId: string, role: string): Promise<WorkspaceMember> {
    const {
      data
    } = await api.patch<WorkspaceMember>(`/workspaces/${workspaceId}/members/${memberId}/role`, {
      role
    });
    return data;
  },
  //* Method for workspace member service
  async remove(workspaceId: string, memberId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },
  //* Method for workspace member service
  async invite(workspaceId: string, email: string): Promise<WorkspaceInvite> {
    const {
      data
    } = await api.post<WorkspaceInvite>(`/workspaces/${workspaceId}/invites`, {
      email
    });
    return data;
  },
  //* Method for workspace member service
  async listInvites(workspaceId: string): Promise<WorkspaceInvite[]> {
    const {
      data
    } = await api.get<WorkspaceInvite[]>(`/workspaces/${workspaceId}/invites`);
    return data;
  },
  //* Method for workspace member service
  async cancelInvite(workspaceId: string, inviteId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/invites/${inviteId}`);
  }
};
export default workspaceMemberService;