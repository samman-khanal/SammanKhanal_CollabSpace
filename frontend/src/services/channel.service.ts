import { api } from "../api/axios";
export type ChannelType = "public" | "private";
export interface Channel {
  _id: string;
  workspaceId: string;
  name: string;
  type: ChannelType;
  createdBy?: string;
  members?: string[];
  createdAt?: string;
  updatedAt?: string;
}
export interface CreateChannelInput {
  name: string;
  type: ChannelType;
}
const channelService = {
  //* Method for channel service
  async list(workspaceId: string): Promise<Channel[]> {
    const {
      data
    } = await api.get<Channel[]>(`/workspaces/${workspaceId}/channels`);
    return data;
  },
  //* Method for channel service
  async create(workspaceId: string, input: CreateChannelInput): Promise<Channel> {
    const payload = {
      name: input.name.trim().toLowerCase().replace(/\s+/g, "-"),
      type: input.type
    };
    const {
      data
    } = await api.post<Channel>(`/workspaces/${workspaceId}/channels`, payload);
    return data;
  },
  //* Method for channel service
  async addMembers(channelId: string, userIds: string[]): Promise<Channel> {
    const {
      data
    } = await api.post<Channel>(`/channels/${channelId}/members`, {
      userIds
    });
    return data;
  },
  //* Method for channel service
  async update(channelId: string, patch: {
    name?: string;
  }): Promise<Channel> {
    const {
      data
    } = await api.patch<Channel>(`/channels/${channelId}`, patch);
    return data;
  },
  //* Method for channel service
  async removeMember(channelId: string, memberId: string): Promise<Channel> {
    const {
      data
    } = await api.delete<Channel>(`/channels/${channelId}/members/${memberId}`);
    return data;
  },
  //* Method for channel service
  async remove(channelId: string): Promise<Channel> {
    const {
      data
    } = await api.delete<Channel>(`/channels/${channelId}`);
    return data;
  }
};
export default channelService;