import React, { useMemo, useRef, useState } from "react";
import AdminNotificationDropdown from "./AdminNotificationDropdown";
import { Camera } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  adminName?: string;
  adminAvatarUrl?: string;
}

const ADMIN_PROFILE_STORAGE_KEY = "admin_profile";

type StoredAdminProfile = {
  name?: string;
  avatarUrl?: string;
};

const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  adminName = "Rizqi Maulana",
  adminAvatarUrl = "/rizwords-nomad.jpg",
}) => {
  const storedProfile = useMemo(() => {
    try {
      const raw = localStorage.getItem(ADMIN_PROFILE_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== "object") return null;
      return parsed as StoredAdminProfile;
    } catch {
      return null;
    }
  }, []);

  const [profileName, setProfileName] = useState(storedProfile?.name || adminName);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(storedProfile?.avatarUrl || adminAvatarUrl);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [draftName, setDraftName] = useState(profileName);
  const [draftAvatarUrl, setDraftAvatarUrl] = useState<string | null>(profileAvatarUrl || null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const persistProfile = (next: StoredAdminProfile) => {
    try {
      localStorage.setItem(ADMIN_PROFILE_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("admin:profileChanged"));
    } catch {
      // ignore
    }
  };

  const initials = useMemo(() => {
    const parts = String(draftName || profileName || "").trim().split(/\s+/g).filter(Boolean);
    const a = parts[0]?.charAt(0) ?? "";
    const b = parts[1]?.charAt(0) ?? (parts[0]?.charAt(1) ?? "");
    const merged = `${a}${b}`.trim();
    return merged ? merged.toUpperCase() : "AD";
  }, [draftName, profileName]);

  const handleAvatarButtonClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDraftAvatarUrl(String(reader.result ?? ""));
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="mb-6 mt-12 md:mt-0 flex w-full min-w-0 items-center justify-between gap-3">
      <h2 className="min-w-0 flex-1 text-xl sm:text-2xl font-semibold text-slate-900 truncate">{title}</h2>
      <div className="flex shrink-0 items-center gap-3 text-sm">
        <AdminNotificationDropdown />
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((p) => !p)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-slate-50"
          >
            <div className="h-8 w-8 rounded-full bg-slate-300 overflow-hidden">
              {profileAvatarUrl ? (
                <img
                  src={profileAvatarUrl}
                  alt={profileName}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <span className="hidden sm:inline text-slate-700 font-medium truncate max-w-[180px]">{profileName}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-slate-400">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
              <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-500">Settings</div>
                <div className="h-px bg-slate-100" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setDraftName(profileName);
                    setDraftAvatarUrl(profileAvatarUrl || null);
                    setIsProfileEditorOpen(true);
                  }}
                  className="w-full px-3 py-2 text-left text-[11px] text-slate-700 hover:bg-slate-50"
                >
                  Edit Profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {isProfileEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Edit Profile</h2>
                <p className="mt-0.5 text-[11px] text-slate-500">Update avatar dan username admin</p>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileEditorOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75l10.5 10.5m0-10.5l-10.5 10.5" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="flex flex-col items-center">
                <div className="relative h-32 w-32 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-slate-500 text-xl font-semibold">
                    {draftAvatarUrl ? (
                      <img src={draftAvatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAvatarButtonClick}
                    className="absolute bottom-6 right-6 translate-x-1/2 translate-y-1/2 z-10 h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md"
                    aria-label="Edit profile picture"
                  >
                    <Camera className="h-4.5 w-4.5" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <div className="mt-6 w-full space-y-2">
                  <label className="block text-[11px] font-medium text-slate-700">Username</label>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[12px] text-slate-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Username admin"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsProfileEditorOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextName = String(draftName ?? "").trim() || profileName;
                  const nextAvatarUrl = String(draftAvatarUrl ?? "").trim() || profileAvatarUrl;
                  setProfileName(nextName);
                  setProfileAvatarUrl(nextAvatarUrl);
                  persistProfile({ name: nextName, avatarUrl: nextAvatarUrl });
                  setIsProfileEditorOpen(false);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-medium text-white shadow-xs hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;
