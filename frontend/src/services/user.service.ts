import { api } from "../api/axios";
export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  passwordChangedAt?: string;
}
const userService = {
  //* Method for user service
  async getMe(): Promise<UserProfile> {
    const {
      data
    } = await api.get<UserProfile>("/users/me");
    return data;
  },
  //* Method for user service
  async uploadAvatar(file: File): Promise<UserProfile> {
    const form = new FormData();
    form.append("avatar", file);
    const {
      data
    } = await api.patch<UserProfile>("/users/me/avatar", form, {
      headers: {
        "Content-Type": undefined
      }
    });
    return data;
  },
  //* Method for user service
  async updateMe(patch: {
    fullName?: string;
    avatarUrl?: string;
  }): Promise<UserProfile> {
    const {
      data
    } = await api.patch<UserProfile>("/users/me", patch);
    return data;
  },
  //* Method for user service
  async changePassword(currentPassword: string, newPassword: string): Promise<{
    changed: boolean;
  }> {
    const {
      data
    } = await api.patch<{
      changed: boolean;
    }>("/users/me/password", {
      currentPassword,
      newPassword
    });
    return data;
  }
};
export default userService;