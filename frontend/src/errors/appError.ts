export class AppError<TCode extends string = string> extends Error {
    constructor(
        readonly code: TCode,
        message: string,
    ) {
        super(message);
        this.name = "AppError";
    }
}