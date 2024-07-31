/// <reference types="react" />
import { Context, Props } from "./transition-render.interface";
import { DataHandlingState } from "../hooks/use-transition-render.interface";
export declare const defaultStore: import("../store/store.interface").Store<DataHandlingState<any, any>, Record<string, DataHandlingState<any, any>>>;
export declare const TransitionRenderContext: import("react").Context<Context>;
declare function TransitionRenderProvider({ children, interceptorList, store }: Props): import("react/jsx-runtime").JSX.Element;
export default TransitionRenderProvider;
