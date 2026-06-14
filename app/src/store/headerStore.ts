import { create } from 'zustand';
import React from 'react';

interface HeaderState {
  title: string;
  rightIcon: React.ReactNode | null;
  onRightPress: (() => void) | null;
  setHeader: (config: { title?: string; rightIcon?: React.ReactNode; onRightPress?: () => void }) => void;
  resetHeader: () => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
  title: 'BillZest',
  rightIcon: null,
  onRightPress: null,
  setHeader: (config) => set((state) => ({
    title: config.title ?? 'BillZest',
    rightIcon: config.rightIcon ?? null,
    onRightPress: config.onRightPress ?? null,
  })),
  resetHeader: () => set({
    title: 'BillZest',
    rightIcon: null,
    onRightPress: null,
  }),
}));
