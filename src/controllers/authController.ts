import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { AppError } from '../utils/errors/AppError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);

        try {
            const result = db.prepare(
                `INSERT INTO users (email, passwordHash, name, role, accessState) 
         VALUES (?, ?, ?, 'user', 'active')`
            ).run(email, passwordHash, name);

            const token = jwt.sign(
                { userId: result.lastInsertRowid, email, role: 'user' },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    id: result.lastInsertRowid,
                    email,
                    name,
                    token
                }
            });
        } catch (error: any) {
            if (error.message?.includes('UNIQUE constraint failed')) {
                throw new AppError('Email already exists', 409);
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = db.prepare(
            'SELECT * FROM users WHERE email = ?'
        ).get(email);

        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        if (user.accessState !== 'active') {
            throw new AppError('Account is not active', 403);
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.userId;

        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }

        const user = db.prepare(
            'SELECT id, email, name, role, accessState, createdAt FROM users WHERE id = ?'
        ).get(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};