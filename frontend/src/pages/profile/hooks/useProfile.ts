import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";
import userService from "../../../services/user.service";
import type { UserProfile } from "../../../services/user.service";
//* Function for use profile
export function useProfile() {
  const {
    updateUser
  } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  //* Function for this task
  useEffect(() => {
    //* Function for this task
    (async () => {
      try {
        const data = await userService.getMe();
        setProfile(data);
        setNameInput(data.fullName);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  //* Function for save name
  const saveName = async () => {
    if (!nameInput.trim() || nameInput.trim() === profile?.fullName) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const updated = await userService.updateMe({
        fullName: nameInput.trim()
      });
      setProfile(updated);
      setEditingName(false);
      updateUser({
        fullName: updated.fullName
      });
      toast.success("Name updated");
    } catch {
      toast.error("Failed to update name");
    } finally {
      setSavingName(false);
    }
  };
  //* Function for cancel edit name
  const cancelEditName = () => {
    setEditingName(false);
    setNameInput(profile?.fullName ?? "");
  };
  //* Function for upload avatar
  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setUploadingAvatar(true);
    try {
      const updated = await userService.uploadAvatar(file);
      setProfile(updated);
      updateUser({
        avatarUrl: updated.avatarUrl
      });
      toast.success("Profile picture updated");
    } catch {
      toast.error("Failed to update profile picture");
    } finally {
      setUploadingAvatar(false);
    }
  };
  //* Function for change password
  const changePassword = async () => {
    if (!currentPassword.trim()) {
      toast.error("Current password is required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      const updated = await userService.getMe();
      setProfile(updated);
      toast.success("Password changed successfully");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };
  //* Function for cancel password change
  const cancelPasswordChange = () => {
    setShowPasswordForm(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  return {
    profile,
    loading,
    editingName,
    setEditingName,
    nameInput,
    setNameInput,
    savingName,
    saveName,
    cancelEditName,
    uploadingAvatar,
    uploadAvatar,
    showPasswordForm,
    setShowPasswordForm,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    savingPassword,
    changePassword,
    cancelPasswordChange
  };
}