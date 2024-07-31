import { type Renderer, Options } from "./use-transition-render.interface";
declare const useTransitionRender: <Data extends unknown = any, DataHandlingError = unknown>(options?: Options<Data>, key?: string | undefined) => Renderer<Data, DataHandlingError>;
export default useTransitionRender;
