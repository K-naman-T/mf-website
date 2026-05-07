"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";

interface OOPositionContextValue {
  setOOPosition: (rect: DOMRect) => void;
  ooRectRef: React.MutableRefObject<DOMRect | null>;
}

const OOPositionContext = createContext<OOPositionContextValue>({
  setOOPosition: () => {},
  ooRectRef: { current: null },
});

export function OOPositionProvider({ children }: { children: ReactNode }) {
  const ooRectRef = useRef<DOMRect | null>(null);
  const setOOPosition = (rect: DOMRect) => {
    ooRectRef.current = rect;
  };
  return (
    <OOPositionContext.Provider value={{ setOOPosition, ooRectRef }}>
      {children}
    </OOPositionContext.Provider>
  );
}

export function useOOPosition(): OOPositionContextValue {
  return useContext(OOPositionContext);
}