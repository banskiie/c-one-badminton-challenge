import { User } from "firebase/auth"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type AuthStore = {
  isAdmin: boolean
  user: User | null
  updateUser: (user: User | null) => void
  updateIsAdmin: (isAdmin: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAdmin: false,
      user: null,
      updateUser: (user) => set(() => ({ user })),
      updateIsAdmin: (status: boolean) => set(() => ({ isAdmin: status })),
    }),
    {
      name: "local-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
