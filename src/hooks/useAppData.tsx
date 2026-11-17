import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadAppData } from "../lib/loadData";
import type { AppData, Item } from "../types/recipe";

type DataState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AppData };

type DataContextValue = DataState & {
  resolveName: (id: string) => string;
  getItem: (id: string) => Item | undefined;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    loadAppData()
      .then((data) => {
        if (active) setState({ status: "ready", data });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Failed to load data",
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<DataContextValue>(() => {
    if (state.status !== "ready") {
      return {
        ...state,
        resolveName: (id) => id,
        getItem: () => undefined,
      };
    }
    const { items } = state.data;
    return {
      ...state,
      resolveName: (id: string) => items[id]?.name ?? id,
      getItem: (id: string) => items[id],
    };
  }, [state]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within DataProvider");
  }
  return ctx;
}
