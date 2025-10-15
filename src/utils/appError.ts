export class AppError extends Error {
    public status: number;
    public isOperational: boolean;
    
    constructor(message: string, status: number, isOperational = true) {
        super(message);
        this.status = status;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}