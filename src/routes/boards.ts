import { Router } from 'express';
import {
    createBoard,
    getBoards,
    getBoardById,
    updateBoard,
    deleteBoard
} from '../controllers/boardController';
import { authMiddleware } from '../middlewares/auth';
import { validateCreateBoard, validateBoardId } from '../middlewares/validation/boardValidators';
import { validate } from '../middlewares/validation/validate';

const router = Router();

// Все роуты требуют аутентификации
router.use(authMiddleware);

// GET /boards - все доски пользователя
router.get('/', getBoards);

// GET /boards/:boardId - конкретная доска
router.get('/:boardId',
    validateBoardId,
    validate,
    getBoardById
);

// POST /boards - создать доску
router.post('/',
    validateCreateBoard,
    validate,
    createBoard
);

// PUT /boards/:boardId - обновить доску
router.put('/:boardId',
    validateBoardId,
    validate,
    updateBoard
);

// DELETE /boards/:boardId - удалить/архивировать доску
router.delete('/:boardId',
    validateBoardId,
    validate,
    deleteBoard
);

export default router;