import { api } from "../api/axios";
export interface Reaction {
  emoji: string;
  user: string;
}
export interface Attachment {
  fileName: string;
  mimeType: string;
  size: number;
  dataBase64: string;
}
export interface Message {
  _id: string;
  channel: string;
  content: string;
  sender: {
    _id: string;
    fullName: string;
    email?: string;
    avatarUrl?: string;
  };
  reactions?: Reaction[];
  attachments?: Attachment[];
  mentions?: Array<{
    _id: string;
    fullName: string;
  }>;
  editedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}
const messageService = {
  //* Method for message service
  async listByChannel(channelId: string): Promise<Message[]> {
    const {
      data
    } = await api.get<Message[]>(`/channels/${channelId}/messages`);
    return data;
  },
  //* Method for message service
  async sendToChannel(channelId: string, content: string, file?: File, mentionIds?: string[]): Promise<Message> {
    const fd = new FormData();
    fd.append("content", content.trim());
    if (file) fd.append("file", file);
    if (mentionIds && mentionIds.length > 0) fd.append("mentions", JSON.stringify(mentionIds));
    const {
      data
    } = await api.post<Message>(`/channels/${channelId}/messages`, fd, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return data;
  },
  //* Method for message service
  async listByDM(dmId: string): Promise<Message[]> {
    const {
      data
    } = await api.get<Message[]>(`/dms/${dmId}/messages`);
    return data;
  },
  //* Method for message service
  async sendToDM(dmId: string, content: string, file?: File, mentionIds?: string[]): Promise<Message> {
    const fd = new FormData();
    fd.append("content", content.trim());
    if (file) fd.append("file", file);
    if (mentionIds && mentionIds.length > 0) fd.append("mentions", JSON.stringify(mentionIds));
    const {
      data
    } = await api.post<Message>(`/dms/${dmId}/messages`, fd, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return data;
  },
  //* Method for message service
  async edit(messageId: string, content: string): Promise<Message> {
    const {
      data
    } = await api.patch<Message>(`/messages/${messageId}`, {
      content: content.trim()
    });
    return data;
  },
  //* Method for message service
  async remove(messageId: string): Promise<void> {
    await api.delete(`/messages/${messageId}`);
  },
  //* Method for message service
  async react(messageId: string, emoji: string): Promise<Message> {
    const {
      data
    } = await api.post<Message>(`/messages/${messageId}/reactions`, {
      emoji
    });
    return data;
  }
};
export default messageService;