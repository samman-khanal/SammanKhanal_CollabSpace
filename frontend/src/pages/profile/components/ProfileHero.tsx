import { useRef } from "react";
import { Camera, Check, Loader2, Pencil, Shield, X } from "lucide-react";
import type { UserProfile } from "../../../services/user.service";
interface ProfileHeroProps {
  profile: UserProfile;
  editingName: boolean;
  nameInput: string;
  savingName: boolean;
  uploadingAvatar: boolean;
  onStartEdit: () => void;
  onNameChange: (value: string) => void;
  onSaveName: () => void;
  onCancelEdit: () => void;
  onAvatarUpload: (file: File) => void;
}
//* Function for get initials
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
//* Function for profile hero
export function ProfileHero({
  profile,
  editingName,
  nameInput,
  savingName,
  uploadingAvatar,
  onStartEdit,
  onNameChange,
  onSaveName,
  onCancelEdit,
  onAvatarUpload
}: ProfileHeroProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  //* Function for this task
  return <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {}
      <div className="h-24 bg-slate-100 dark:bg-slate-700/50" />

      <div className="px-7 pb-7 -mt-10">
        {}
        <div className="relative w-20 h-20 mb-4">
          {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.fullName} className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-4 ring-white dark:ring-slate-800" /> : <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-semibold text-2xl shadow-lg ring-4 ring-white dark:ring-slate-800">
              {getInitials(profile.fullName)}
            </div>}
          <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar} className="absolute -bottom-2 -right-2 w-9 h-9 bg-white dark:bg-slate-700 border-2 border-white dark:border-slate-800 rounded-xl flex items-center justify-center shadow-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-all group disabled:opacity-60" title="Change profile picture">
            
            {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300 group-hover:text-indigo-500 transition-colors" />}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
          const file = e.target.files?.[0];
          if (file) onAvatarUpload(file);
          e.target.value = "";
        }} />
          
        </div>

        {}
        <div className="flex items-center gap-2 mb-2">
          {editingName ? <div className="flex items-center gap-2">
              <input type="text" value={nameInput} onChange={e => onNameChange(e.target.value)} autoFocus onKeyDown={e => {
            if (e.key === "Enter") onSaveName();
            if (e.key === "Escape") onCancelEdit();
          }} className="text-base font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 border border-indigo-300 dark:border-indigo-500 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-56" />
            
              <button onClick={onSaveName} disabled={savingName} className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-sm">
              
                {savingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              </button>
              <button onClick={onCancelEdit} className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
              
                <X className="w-3.5 h-3.5" />
              </button>
            </div> : <>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">
                {profile.fullName}
              </h2>
              <button onClick={onStartEdit} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all" title="Edit name">
              
                <Pencil className="w-3 h-3" />
              </button>
            </>}
        </div>

        {}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full capitalize border border-indigo-100 dark:border-indigo-800">
            <Shield className="w-3 h-3" />
            {profile.role}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</span>
        </div>
      </div>
    </div>;
}