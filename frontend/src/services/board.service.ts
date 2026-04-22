import { api } from "../api/axios";
export interface Board {
  _id: string;
  workspace: string;
  name: string;
  methodology?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface Column {
  _id: string;
  board: string;
  title: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}
export interface Task {
  _id: string;
  board: string;
  column: string;
  title: string;
  description?: string;
  assignees: string[];
  dueDate?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  completed?: boolean;
  checklist?: {
    _id?: string;
    text: string;
    done: boolean;
  }[];
  order: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export type MyTask = Omit<Task, "board" | "column"> & {
  board: string | {
    _id: string;
    name: string;
  };
  column: string | {
    _id: string;
    name: string;
  };
};
export interface Comment {
  _id: string;
  task: string;
  author: {
    _id: string;
    fullName: string;
    email?: string;
    avatarUrl?: string;
  };
  text: string;
  createdAt: string;
  updatedAt: string;
}
export interface Attachment {
  _id: string;
  task: string;
  uploadedBy: string;
  fileName: string;
  mimeType: string;
  size: number;
  dataBase64: string;
  createdAt: string;
  updatedAt: string;
}
const boardService = {
  //* Method for board service
  async createBoard(workspaceId: string, name: string, methodology?: string): Promise<Board> {
    const {
      data
    } = await api.post<Board>(`/workspaces/${workspaceId}/boards`, {
      name,
      ...(methodology && {
        methodology
      })
    });
    return data;
  },
  //* Method for board service
  async listBoards(workspaceId: string): Promise<Board[]> {
    const {
      data
    } = await api.get<Board[]>(`/workspaces/${workspaceId}/boards`);
    return data;
  },
  //* Method for board service
  async getBoard(boardId: string): Promise<Board> {
    const {
      data
    } = await api.get<Board>(`/boards/${boardId}`);
    return data;
  },
  //* Method for board service
  async updateBoard(boardId: string, updates: Partial<Pick<Board, "name">>): Promise<Board> {
    const {
      data
    } = await api.patch<Board>(`/boards/${boardId}`, updates);
    return data;
  },
  //* Method for board service
  async deleteBoard(boardId: string): Promise<void> {
    await api.delete(`/boards/${boardId}`);
  },
  //* Method for board service
  async createColumn(boardId: string, title: string): Promise<Column> {
    const {
      data
    } = await api.post<Column>(`/boards/${boardId}/columns`, {
      title
    });
    return data;
  },
  //* Method for board service
  async listColumns(boardId: string): Promise<Column[]> {
    const {
      data
    } = await api.get<Column[]>(`/boards/${boardId}/columns`);
    return data;
  },
  //* Method for board service
  async updateColumn(columnId: string, updates: Partial<Pick<Column, "title">>): Promise<Column> {
    const {
      data
    } = await api.patch<Column>(`/columns/${columnId}`, updates);
    return data;
  },
  //* Method for board service
  async deleteColumn(columnId: string): Promise<void> {
    await api.delete(`/columns/${columnId}`);
  },
  //* Method for board service
  async reorderColumns(boardId: string, orderedIds: string[]): Promise<void> {
    await api.patch(`/boards/${boardId}/columns/reorder`, {
      orderedIds
    });
  },
  //* Method for board service
  async createTask(boardId: string, columnId: string, title: string): Promise<Task> {
    const {
      data
    } = await api.post<Task>(`/boards/${boardId}/columns/${columnId}/tasks`, {
      title
    });
    return data;
  },
  //* Method for board service
  async listTasks(boardId: string): Promise<Task[]> {
    const {
      data
    } = await api.get<Task[]>(`/boards/${boardId}/tasks`);
    return data;
  },
  //* Method for board service
  async getTask(taskId: string): Promise<Task> {
    const {
      data
    } = await api.get<Task>(`/tasks/${taskId}`);
    return data;
  },
  //* Method for board service
  async updateTask(taskId: string, updates: Partial<Pick<Task, "title" | "description" | "assignees" | "dueDate" | "priority" | "completed" | "checklist">>): Promise<Task> {
    const {
      data
    } = await api.patch<Task>(`/tasks/${taskId}`, updates);
    return data;
  },
  //* Method for board service
  async deleteTask(taskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  },
  //* Method for board service
  async moveTask(taskId: string, toColumnId: string, toOrder: number): Promise<Task> {
    const {
      data
    } = await api.patch<Task>(`/tasks/${taskId}/move`, {
      toColumnId,
      toOrder
    });
    return data;
  },
  //* Method for board service
  async reorderTasks(columnId: string, orderedIds: string[]): Promise<void> {
    await api.patch(`/columns/${columnId}/tasks/reorder`, {
      orderedIds
    });
  },
  //* Method for board service
  async getMyWorkspaceTasks(workspaceId: string): Promise<MyTask[]> {
    const {
      data
    } = await api.get<MyTask[]>(`/workspaces/${workspaceId}/my-tasks`);
    return data;
  },
  //* Method for board service
  async listComments(taskId: string): Promise<Comment[]> {
    const {
      data
    } = await api.get<Comment[]>(`/tasks/${taskId}/comments`);
    return data;
  },
  //* Method for board service
  async addComment(taskId: string, text: string): Promise<Comment> {
    const {
      data
    } = await api.post<Comment>(`/tasks/${taskId}/comments`, {
      text
    });
    return data;
  },
  //* Method for board service
  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  },
  //* Method for board service
  async listAttachments(taskId: string): Promise<Attachment[]> {
    const {
      data
    } = await api.get<Attachment[]>(`/tasks/${taskId}/attachments`);
    return data;
  },
  //* Method for board service
  async uploadAttachment(taskId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append("file", file);
    const {
      data
    } = await api.post<Attachment>(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return data;
  },
  //* Method for board service
  async deleteAttachment(attachmentId: string): Promise<void> {
    await api.delete(`/attachments/${attachmentId}`);
  }
};
export default boardService;