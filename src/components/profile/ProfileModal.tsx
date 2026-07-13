import { useState } from "react";
import { X, User } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({
  open,
  onClose,
}: Props) {
  const {
  userName,
  setUserName,
  profileImage,
  setProfileImage,
} = useApp();

  const [name, setName] = useState(userName);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[420px] rounded-3xl bg-slate-900 border border-slate-800 p-6">

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            My Profile
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-8 flex justify-center">
  <label className="relative cursor-pointer">

    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
          setProfileImage(reader.result as string);
        };

        reader.readAsDataURL(file);
      }}
    />

    {profileImage ? (
      <img
        src={profileImage}
        alt="Profile"
        className="h-24 w-24 rounded-full border-4 border-sky-500 object-cover"
      />
    ) : (
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800">
        <User size={40} className="text-slate-400" />
      </div>
    )}

  </label>
</div>

        <div className="mt-8">
          <label className="mb-2 block text-sm text-slate-400">
            User Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-sky-500"
          />
        </div>

        <button
          onClick={() => {
            setUserName(name);
            onClose();
          }}
          className="mt-8 w-full rounded-xl bg-sky-600 py-3 font-semibold text-white hover:bg-sky-500"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}