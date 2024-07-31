import { PropsWithChildren } from "react";
import type { DataHandlerExecutor, DataHandlingState } from "../hooks/use-transition-render.interface";
import { Store } from "../store/store.interface";
export interface DataHandlerExecutorInterceptor<Data extends any = any> {
    (previousExecutorData: Data | undefined, dataHandlerExecutor: () => ReturnType<DataHandlerExecutor<Data>>, executorId?: string): ReturnType<typeof dataHandlerExecutor>;
}
export interface Context {
    getInterceptorList: <Data extends any>() => DataHandlerExecutorInterceptor<Data>[];
    getStroe: <Data extends any, DataHandlingError extends any>() => Store<DataHandlingState<Data, DataHandlingError>>;
}
export interface Props<Data extends any = any, DataHandlingError = any> extends PropsWithChildren {
    store?: Store<DataHandlingState<Data, DataHandlingError>>;
    interceptorList?: DataHandlerExecutorInterceptor<Data>[];
}
