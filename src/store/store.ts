import { create } from "zustand";

type usersChoice = {
  choice: object;
  updateChoice: (answer: any) => void;
  clearChoice: () => void;
};

const initialUsersChoice = {
  mood: "",
  genre: [],
  year: "",
  actor: "",
};

export const useUsersChoice = create<usersChoice>((set) => ({
  choice: initialUsersChoice,
  updateChoice: (answers: any) => set(() => ({ choice: answers })),
  clearChoice: () =>
    set(() => ({
      choice: initialUsersChoice,
    })),
}));
