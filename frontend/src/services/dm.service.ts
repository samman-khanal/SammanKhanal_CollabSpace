import { api } from "../api/axios";
export interface DMThread {
  _id: string;
  workspaceId: string;
  participants?: string[];
  otherUser?: {
    _id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    online?: boolean;
  };
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
const dmService = {
  //* Method for dm service
  async list(workspaceId: string): Promise<DMThread[]> {
    const {
      data
    } = await api.get<DMThread[]>(`/workspaces/${workspaceId}/dms`);
    return data;
  },
  //* Method for dm service
  async openOrCreate(workspaceId: string, otherUserId: string): Promise<DMThread> {
    const {
      data
    } = await api.post<DMThread>(`/workspaces/${workspaceId}/dms`, {
      otherUserId
    });
    return data;
  }
};
export default dmService;