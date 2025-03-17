import React, { createContext, useContext, useState } from "react";

interface AnkyContextType {
  isAnkyModeActive: boolean;
  setIsAnkyModeActive: (value: boolean) => void;
}

const AnkyContext = createContext<AnkyContextType | undefined>(undefined);

export function useAnky() {
  const context = useContext(AnkyContext);
  if (!context) {
    throw new Error("useAnky must be used within an AnkyProvider");
  }
  return context;
}

export default function AnkyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAnkyModeActive, setIsAnkyModeActive] = useState<boolean>(false);

  const value = {
    isAnkyModeActive,
    setIsAnkyModeActive,
  };

  return <AnkyContext.Provider value={value}>{children}</AnkyContext.Provider>;
}
