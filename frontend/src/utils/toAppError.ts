import { isAxiosError } from "axios";
import { z } from "zod";

import { AppError } from "@/errors/appError";

export interface ErrorEntry<TCode extends string> {
    code: TCode;
    message: string;
}

export interface ErrorMapper<TCode extends string> {
    validation: ErrorEntry<TCode>;
    network: ErrorEntry<TCode>;
    unexpected: ErrorEntry<TCode>;
    status: Partial<Record<number, ErrorEntry<TCode>>>;
}

export const createToError = <
    TCode extends string,
    TError extends AppError<TCode>,
>(
    mapper: ErrorMapper<TCode>,
    ErrorClass: new (code: TCode, message: string) => TError,
) => {
    return (error: unknown): TError => {
        const entry = resolveErrorEntry(error, mapper);
        return new ErrorClass(entry.code, entry.message);
    };
};

const resolveErrorEntry = <TCode extends string>(
    error: unknown,
    mapper: ErrorMapper<TCode>,
): ErrorEntry<TCode> => {
    if (error instanceof z.ZodError) {
        return mapper.validation;
    }

    if (!isAxiosError(error)) {
        return mapper.unexpected;
    }

    if (!error.response) {
        return mapper.network;
    }

    return mapper.status[error.response.status] ?? mapper.unexpected;
};