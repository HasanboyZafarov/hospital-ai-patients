import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "../i18n";

type Lang = "en" | "ru" | "uz";

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: "en",
      setLang: (lang) => {
        i18n.changeLanguage(lang);
        set({ lang });
      },
    }),
    {
      name: "language-preference",
      onRehydrateStorage: () => (state) => {
        if (state?.lang) {
          i18n.changeLanguage(state.lang);
        }
      },
    }
  )
);
