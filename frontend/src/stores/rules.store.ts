import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Rule } from "@/engine/types";
import mockRules from "@/data/rules.mock.json";

interface RulesState {
    rules: Rule[];
    addRule: (rule: Rule) => void;
    updateRule: (id: string, patch: Partial<Rule>) => void;
    removeRule: (id: string) => void;
    toggleRule: (id: string) => void;
    reset: () => void;
}

export const useRules = create<RulesState>()(
    persist(
        (set) => ({
            rules: mockRules as Rule[],
            addRule: (rule) => set((s) => ({ rules: [...s.rules, rule] })),
            updateRule: (id, patch) => set((s) => ({
                rules: s.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
            })),
            removeRule: (id) => set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),
            toggleRule: (id) => set((s) => ({
                rules: s.rules.map((r) => (r.id === id ? { ...r, ativa: !r.ativa } : r)),
            })),
            reset: () => set({ rules: mockRules as Rule[] }),
        }),
        { name: "komissx_rules" }
    )
);
