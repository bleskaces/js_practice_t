import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../utils/errors/AppError';


const expressValidator = require('express-validator');
const { validationResult } = expressValidator;

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((error: any) => ({
            field: error.type === 'field' ? error.path : error.type,
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined
        }));

        throw new ValidationError('Validation failed', formattedErrors);
    }

    next();
};