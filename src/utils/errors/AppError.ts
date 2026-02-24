export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    details?: any;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 400);
        this.name = 'ValidationError';
        this.details = details;
    }
}

export class NotFoundError extends AppError {
    constructor(entity: string, id?: string | number) {
        super(`${entity}${id ? ` with id ${id}` : ''} not found`, 404);
        this.name = 'NotFoundError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}