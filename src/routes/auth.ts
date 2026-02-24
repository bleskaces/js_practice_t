// src/routes/auth.ts
import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { validateRegistration, validateLogin } from '../middlewares/validation/userValidators';
import { validate } from '../middlewares/validation/validate';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Регистрация (не требует аутентификации)
router.post('/register',
    validateRegistration,
    validate,
    register
);

// Вход (не требует аутентификации)
router.post('/login',
    validateLogin,
    validate,
    login
);

// Получить текущего пользователя (требует аутентификации)
router.get('/me',
    authMiddleware,
    getCurrentUser
);

export default router;