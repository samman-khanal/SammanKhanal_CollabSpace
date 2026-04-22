import ProfilePage from "../pages/profile/ProfilePage";
interface UserProfileProps {
  onBack: () => void;
  onOpenSidebar: () => void;
}
//* Function for user profile
export default function UserProfile({
  onBack,
  onOpenSidebar
}: UserProfileProps) {
  return <ProfilePage onBack={onBack} onOpenSidebar={onOpenSidebar} />;
}