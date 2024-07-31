import { createContext, useMemo } from "react";
import { Context, Props } from "./transition-render.interface";
import { createStore } from "../store/store";
import { DataHandlingState } from "../hooks/use-transition-render.interface";

export const defaultStore = createStore<DataHandlingState<any, any>>();

export const TransitionRenderContext = createContext<Context>({
  getInterceptorList: () => {
    return [];
  },
  getStroe: () => {
    return defaultStore;
  },
});

function TransitionRenderProvider({ children, interceptorList, store = defaultStore }: Props) {
  const state = useMemo(
    () => ({
      getInterceptorList: () => {
        return interceptorList !== undefined ? interceptorList : [];
      },
      getStroe: () => {
        return store;
      },
    }),
    [interceptorList, store],
  );
  return (
    <TransitionRenderContext.Provider value={state}>{children}</TransitionRenderContext.Provider>
  );
}

export default TransitionRenderProvider;
