/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-loop-func */
import { useCallback, useContext, useMemo, useSyncExternalStore, useId } from "react";
import {
  DataHandlingStatus,
  type Render,
  type Renderer,
  type DataHandler,
  DataHandlingState,
  Options,
  DataResetHandler,
} from "./use-transition-render.interface";
import { TransitionRenderContext } from "../providers";

const useTransitionRender = <Data extends any = any, DataHandlingError = Error | unknown>(
  options: Options<Data> = {},
  key: string | undefined = undefined,
): Renderer<Data, DataHandlingError> => {
  const hookId = useId();
  const currentHookKey = useMemo(() => key ?? hookId, [key, hookId]);
  const context = useContext(TransitionRenderContext);
  const store = useMemo(() => context.getStroe<Data, DataHandlingError>(), [context]);
  const globalState = useSyncExternalStore<
    Record<string, DataHandlingState<Data, DataHandlingError>>
  >(store.subscribe, store.getSnapshot, store.getSnapshot);
  const state = useMemo<DataHandlingState<Data, DataHandlingError>>(() => {
    if (currentHookKey in globalState) {
      return globalState[currentHookKey];
    }
    if ("default" in options) {
      store.set(
        currentHookKey,
        {
          status: DataHandlingStatus.SUCCESS,
          data: options.default,
        },
        true,
      );
      return {
        status: DataHandlingStatus.SUCCESS,
        data: options.default,
      };
    }
    store.set(
      currentHookKey,
      {
        status: DataHandlingStatus.IDLE,
      },
      true,
    );
    return { status: DataHandlingStatus.IDLE };
  }, [currentHookKey, globalState, options, store]);

  const handleData: DataHandler<Data> = useCallback(
    async (dataHandlerExecutor, executorId?: string) => {
      try {
        const { getInterceptorList } = context;
        const interceptorList = getInterceptorList<Data>();
        if (interceptorList.length > 0) {
          let previousResult: Data | undefined;
          for (let i = 0; i < interceptorList.length; i += 1) {
            const dataHandlerExecutorInterceptor = interceptorList[i];
            const evaludatedData = dataHandlerExecutorInterceptor(
              previousResult,
              () => dataHandlerExecutor(store.get(currentHookKey)?.data),
              executorId,
            );
            if (i === 0 && evaludatedData instanceof Promise) {
              /**
               * If the data is a promise, the status is set to `IN_PROGRESS` and the promise is stored.
               */
              store.set(currentHookKey, (prev) => {
                return {
                  promise: evaludatedData,
                  data: prev?.data,
                  previousData: prev?.previousData,
                  status: DataHandlingStatus.IN_PROGRESS,
                };
              });
            }
            previousResult = await evaludatedData;
            store.set(currentHookKey, (prev) => ({
              data: previousResult,
              previousData: prev?.data,
              status: DataHandlingStatus.SUCCESS,
            }));
            if (i === interceptorList.length - 1) {
              return await evaludatedData;
            }
          }
        }
        const evaludatedData = dataHandlerExecutor(store.get(currentHookKey)?.data);
        const promise =
          evaludatedData instanceof Promise ? evaludatedData : Promise.resolve(evaludatedData);
        if (evaludatedData instanceof Promise) {
          /**
           * If the data is a promise, the status is set to `IN_PROGRESS` and the promise is stored.
           */
          store.set(currentHookKey, (prev) => ({
            data: prev?.data,
            previousData: prev?.previousData,
            status: DataHandlingStatus.IN_PROGRESS,
            promise,
          }));
        }
        const data = await promise;
        store.set(currentHookKey, (prev) => ({
          data,
          previousData: prev?.data,
          status: DataHandlingStatus.SUCCESS,
        }));
        return data;
      } catch (e) {
        const error = e as DataHandlingError;
        store.set(currentHookKey, (prev) => ({
          error,
          data: prev?.data,
          previousData: prev?.previousData,
          status: DataHandlingStatus.ERROR,
        }));
        throw e;
      }
    },
    [context, currentHookKey, store],
  );

  const handleDataReset: DataResetHandler = useCallback(() => {
    store.set(currentHookKey, (prev) => ({
      previousData: prev?.data,
      status: DataHandlingStatus.IDLE,
    }));
  }, [currentHookKey, store]);

  const render: Render<Data, DataHandlingError> = useCallback(
    (
      renderWhenDataHandlingSuccess,
      renderWhenDataHandlingIdle,
      renderWhenDataHandlingInProgress,
      renderWhenDataHandlingError,
    ) => {
      const { data, previousData, status, error, promise } = state;
      switch (status) {
        case DataHandlingStatus.IDLE: {
          return typeof renderWhenDataHandlingIdle === "function"
            ? renderWhenDataHandlingIdle(previousData)
            : renderWhenDataHandlingIdle;
        }
        case DataHandlingStatus.SUCCESS: {
          return typeof renderWhenDataHandlingSuccess === "function"
            ? renderWhenDataHandlingSuccess((data ?? options.default) as Data, previousData)
            : renderWhenDataHandlingSuccess || null;
        }
        case DataHandlingStatus.ERROR: {
          if (typeof renderWhenDataHandlingError === undefined) {
            /**
             * Propagate the error upwards if the error component does not exist,
             * so that it can be handled at the error boundary.
             */
            if (error instanceof Error) {
              throw error;
            }
          }
          if (typeof error === "undefined") {
            throw new Error("The `ProcessError` is undefined");
          }
          return typeof renderWhenDataHandlingError === "function"
            ? renderWhenDataHandlingError(error, previousData)
            : renderWhenDataHandlingError || null;
        }
        case DataHandlingStatus.IN_PROGRESS:
        default: {
          return typeof renderWhenDataHandlingInProgress === "function"
            ? renderWhenDataHandlingInProgress(promise, previousData)
            : renderWhenDataHandlingInProgress;
        }
      }
    },
    [state, options.default],
  );

  return [render, handleData, handleDataReset, state];
};

export default useTransitionRender;
