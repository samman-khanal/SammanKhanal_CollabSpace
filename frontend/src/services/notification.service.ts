import { api } from "../api/axios";
export interface NotificationMeta {
  channelId?: string;
  channelName?: string;
  dmId?: string;
  messageId?: string;
  senderId?: string;
  senderName?: string;
  preview?: string;
  boardId?: string;
  boardName?: string;
  taskId?: string;
  taskTitle?: string;
  actorName?: string;
  workspaceId?: string;
  workspaceName?: string;
  userId?: string;
  userName?: string;
  role?: string;
  commentId?: string;
  commenterName?: string;
  [key: string]: string | undefined;
}
export interface Notification {
  _id: string;
  user: string;
  type: string;
  message: string;
  meta: NotificationMeta;
  readAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}
const notificationService = {
  //* Method for notification service
  async list(): Promise<Notification[]> {
    const {
      data
    } = await api.get<Notification[]>("/notifications");
    return data;
  },
  //* Method for notification service
  async markRead(id: string): Promise<{
    read: boolean;
  }> {
    const {
      data
    } = await api.patch<{
      read: boolean;
    }>(`/notifications/${id}/read`);
    return data;
  },
  //* Method for notification service
  async markAllRead(): Promise<{
    readAll: boolean;
  }> {
    const {
      data
    } = await api.patch<{
      readAll: boolean;
    }>("/notifications/read-all");
    return data;
  },
  //* Method for notification service
  async remove(id: string): Promise<{
    deleted: boolean;
  }> {
    const {
      data
    } = await api.delete<{
      deleted: boolean;
    }>(`/notifications/${id}`);
    return data;
  },
  //* Method for notification service
  async removeAllRead(): Promise<{
    deleted: number;
  }> {
    const {
      data
    } = await api.delete<{
      deleted: number;
    }>("/notifications/read");
    return data;
  }
};
export default notificationService;