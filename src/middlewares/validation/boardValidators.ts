const expressValidator = require('express-validator');
const { body, param } = expressValidator;

export const validateCreateBoard = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Board name is required')
        .isLength({ max: 100 })
        .withMessage('Board name cannot exceed 100 characters'),

    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),

    body('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean')
];

export const validateBoardId = [
    param('boardId')
        .isInt({ min: 1 })
        .withMessage('Board ID must be a positive integer')
];