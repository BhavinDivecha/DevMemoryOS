import { create } from "zustand";
export const useAuth = create((set) => ({
    token: localStorage.getItem("sm_token"),
    setToken: (token) => {
        if (token)
            localStorage.setItem("sm_token", token);
        else
            localStorage.removeItem("sm_token");
        set({ token });
    }
}));
