import { createContext, useMemo } from "react";
import { Context, Props } from "./transition-render.interface";
import { createStore } from "../store/store";
import { DataHandlingState } from "../hooks/use-transition-render.interface";

export const defaultStore = createStore<DataHandlingState<any, any>>();

export const TransitionRenderContext = createContext<Context>({
  getDataHandlerExecutorInterceptorList: () => {
    return [];
  },
  getStroe: () => {
    return defaultStore;
  },
});

function TransitionRenderProvider({
  children,
  dataHandlerExecutorInterceptorList,
  store = defaultStore,
}: Props) {
  const state = useMemo(
    () => ({
      getDataHandlerExecutorInterceptorList: () => {
        return dataHandlerExecutorInterceptorList !== undefined
          ? dataHandlerExecutorInterceptorList
          : [];
      },
      getStroe: () => {
        return store;
      },
    }),
    [dataHandlerExecutorInterceptorList, store],
  );
  return (
    <TransitionRenderContext.Provider value={state}>{children}</TransitionRenderContext.Provider>
  );
}

export default TransitionRenderProvider;
