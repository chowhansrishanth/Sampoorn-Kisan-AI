import FarmProfileWizard from "./FarmProfileWizard";

export default function ProfileModal({ user, onClose, onUpdateUser }) {
  const handleSaveProfile = async (updatedUser) => {
    if (onUpdateUser) {
      await onUpdateUser(updatedUser);
    }
  };

  return (
    <FarmProfileWizard
      user={user}
      onClose={onClose}
      onSaveProfile={handleSaveProfile}
    />
  );
}
