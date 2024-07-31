import { ReactNode } from "react";
export declare enum DataHandlingStatus {
    IDLE = "IDLE",
    IN_PROGRESS = "IN_PROGRESS",
    SUCCESS = "SUCCESS",
    ERROR = "ERROR"
}
/**
 * `DataHandlerExecutor` is a function that handles data.
 */
export interface DataHandlerExecutor<Data extends any = any> {
    (previousData?: Data): Promise<Data> | Data;
}
export interface DataHandler<Data> {
    (executor: DataHandlerExecutor<Data>, executorId?: string): Promise<Data>;
}
export interface DataResetHandler {
    (): void;
}
/**
 * `IdleRenderer` is rendered when the data handling status is `IDLE`.
 */
export type IdleRenderer<Data> = ReactNode | ((previousData?: Data) => ReactNode);
/**
 * `SuccessRenderer` is rendered when the data handling status is `SUCCESS`.
 */
export type SuccessRenderer<Data> = ReactNode | ((data: Data, previousData?: Data) => ReactNode);
/**
 * `InProgressRenderer` is rendered when the data handling status is `IN_PROGRESS`.
 */
export type InProgressRenderer<Data> = ReactNode | ((data?: Promise<Data>, previousData?: Data) => ReactNode);
/**
 * `ErrorRenderer` is rendered when the data handling status is `ERROR`.
 */
export type ErrorRenderer<DataHandlingError extends Error | unknown = unknown, Data extends any = any> = ReactNode | ((error: DataHandlingError, previousData?: Data) => ReactNode);
export interface Render<Data = any, DataHandlingError = any> {
    (SuccessRenderer?: SuccessRenderer<Data>, idleRenderer?: IdleRenderer<Data>, inProgressRenderer?: InProgressRenderer<Data>, ErrorRenderer?: ErrorRenderer<DataHandlingError, Data>): ReactNode;
}
export interface DataHandlingState<Data, DataHandlingError> {
    status: DataHandlingStatus;
    error?: DataHandlingError;
    promise?: Promise<Data>;
    data?: Data;
    previousData?: Data;
}
export type Renderer<Data, DataHandlingError> = [
    render: Render<Data, DataHandlingError>,
    handleData: DataHandler<Data>,
    handleResetData: DataResetHandler,
    dataHandlingState: DataHandlingState<Data, DataHandlingError>
];
export interface Options<Data extends any = any> {
    default?: Data;
}
