export interface FileLogInput {
    logsDirectory: string;
    module: string;
    action: string;
    entity?: string;
    entityId?: string | number;
    message?: string;
    data?: Record<string, unknown>;
}