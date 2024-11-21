import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UseVisitorType {
  hasVisited: boolean;
  setVisit: (value: boolean) => void;
}

const UseVisitor = create(
  persist<UseVisitorType>(
    (set) => ({
      hasVisited: false,
      setVisit: (value: boolean) => {
        set({ hasVisited: value });
      },
    }),
    {
      name: "echopay-visitor-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default UseVisitor;
