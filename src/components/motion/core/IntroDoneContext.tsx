"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface IntroDoneContextValue {
  signal: () => void;
  isIntroDone: boolean;
}

const IntroDoneContext = createContext<IntroDoneContextValue>({ signal: () => {}, isIntroDone: false });

export function IntroDoneProvider({ children }: { children: ReactNode }) {
  const [isIntroDone, setIsIntroDone] = useState(false);
  const signal = useCallback(() => setIsIntroDone(true), []);
  return <IntroDoneContext.Provider value={{ signal, isIntroDone }}>{children}</IntroDoneContext.Provider>;
}

export function useIntroDone(): () => void {
  return useContext(IntroDoneContext).signal;
}

export function useIsIntroDone(): boolean {
  return useContext(IntroDoneContext).isIntroDone;
}