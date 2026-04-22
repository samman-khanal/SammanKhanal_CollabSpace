import { Loader2, Menu } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useProfile } from "./hooks/useProfile";
import { ProfileHero } from "./components/ProfileHero";
import { ProfileInfoCards } from "./components/ProfileInfoCards";
import { ChangePasswordForm } from "./components/ChangePasswordForm";
interface ProfilePageProps {
  onBack: () => void;
  onOpenSidebar: () => void;
}
//* Function for profile page
export default function ProfilePage({
  onBack: _onBack,
  onOpenSidebar
}: ProfilePageProps) {
  useDocumentTitle("Profile");
  const {
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
  } = useProfile();
  if (loading) {
    return <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Loading profile…</span>
        </div>
      </div>;
  }
  if (!profile) return null;
  //* Function for this task
  return <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 overflow-auto">
      {}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b
       border-slate-200 dark:border-slate-700">
        
        <div className="w-full px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={onOpenSidebar} className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-400
             hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all" title="Open sidebar">
            
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white leading-none">My Profile</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account details</p>
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 w-full px-6 py-7 space-y-5">
        <ProfileHero profile={profile} editingName={editingName} nameInput={nameInput} savingName={savingName} uploadingAvatar={uploadingAvatar} onStartEdit={() => setEditingName(true)} onNameChange={setNameInput} onSaveName={saveName} onCancelEdit={cancelEditName} onAvatarUpload={uploadAvatar} />
        

        <ProfileInfoCards profile={profile} />

        <ChangePasswordForm show={showPasswordForm} currentPassword={currentPassword} newPassword={newPassword} confirmPassword={confirmPassword} saving={savingPassword} passwordChangedAt={profile.passwordChangedAt} onToggle={() => setShowPasswordForm(true)} onCurrentPasswordChange={setCurrentPassword} onNewPasswordChange={setNewPassword} onConfirmPasswordChange={setConfirmPassword} onSave={changePassword} onCancel={cancelPasswordChange} />
        
      </div>
    </div>;
}