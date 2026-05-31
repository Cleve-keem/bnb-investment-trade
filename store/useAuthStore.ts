import { create } from "zustand";

interface userProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  isOtpVerified: boolean;
}

interface AuthStore {
  user: userProfile | null;
  isAuthenticated: boolean;
  isInitialLoading: boolean;

  setSession: (user: userProfile | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialLoading: true,

  setSession: (userProfile) => {
    set(() => ({
      user: userProfile,
    }));
  },

  clearSession: () =>
    set(() => ({
      user: null,
      isAuthenticated: false,
      isInitialLoading: false,
    })),
}));
