import { create } from "zustand";

type AuthState = { token: string | null; setToken: (t: string | null) => void };

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem("sm_token"),
  setToken: (token) => {
    if (token) localStorage.setItem("sm_token", token);
    else localStorage.removeItem("sm_token");
    set({ token });
  }
}));
