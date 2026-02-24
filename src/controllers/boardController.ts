import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { AppError, NotFoundError } from '../utils/errors/AppError';

export const getBoards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.userId;

        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }

        const boards = db.prepare(`
      SELECT 
        b.*,
        u.email as owner_email,
        CASE 
          WHEN b.ownerId = ? THEN 'owner'
          ELSE 'member'
        END as user_role
      FROM boards b
      LEFT JOIN users u ON b.ownerId = u.id
      WHERE b.ownerId = ? 
         OR b.id IN (
           SELECT boardId FROM board_members WHERE userId = ?
         )
         OR b.isPublic = true
      ORDER BY b.createdAt DESC
    `).all(userId, userId, userId);

        res.json({
            success: true,
            data: boards,
            count: boards.length
        });
    } catch (error) {
        next(error);
    }
};

export const createBoard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.userId;
        const { name, description, isPublic = false } = req.body;

        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }

        const existingBoard = db.prepare(
            'SELECT id FROM boards WHERE name = ? AND ownerId = ?'
        ).get(name, userId);

        if (existingBoard) {
            throw new AppError('You already have a board with this name', 409);
        }

        const result = db.prepare(
            `INSERT INTO boards (name, description, ownerId, isPublic, status) 
       VALUES (?, ?, ?, ?, 'active')`
        ).run(name, description, userId, isPublic ? 1 : 0);

        const newBoard = db.prepare(
            'SELECT * FROM boards WHERE id = ?'
        ).get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: 'Board created successfully',
            data: newBoard
        });
    } catch (error) {
        next(error);
    }
};

export const getBoardById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { boardId } = req.params;
        const userId = (req as any).user?.userId;

        const board = db.prepare(
            `SELECT b.*, 
              u.email as owner_email,
              u.name as owner_name
       FROM boards b
       LEFT JOIN users u ON b.ownerId = u.id
       WHERE b.id = ?`
        ).get(boardId);

        if (!board) {
            throw new NotFoundError('Board', boardId);
        }

        if (board.ownerId !== userId && !board.isPublic) {
            const isMember = db.prepare(
                'SELECT id FROM board_members WHERE boardId = ? AND userId = ?'
            ).get(boardId, userId);

            if (!isMember) {
                throw new AppError('Access denied to this board', 403);
            }
        }

        const columns = db.prepare(
            'SELECT * FROM columns WHERE boardId = ? ORDER BY orderIndex'
        ).all(boardId);

        res.json({
            success: true,
            data: {
                ...board,
                columns
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateBoard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { boardId } = req.params;
        const userId = (req as any).user?.userId;
        const updates = req.body;

        const board = db.prepare(
            'SELECT * FROM boards WHERE id = ?'
        ).get(boardId);

        if (!board) {
            throw new NotFoundError('Board', boardId);
        }

        if (board.ownerId !== userId) {
            throw new AppError('Only board owner can edit', 403);
        }

        const allowedUpdates = ['name', 'description', 'isPublic', 'status'];
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                updateValues.push(updates[field]);
            }
        });

        if (updateFields.length === 0) {
            throw new AppError('No valid fields to update', 400);
        }

        updateValues.push(boardId);

        db.prepare(
            `UPDATE boards SET ${updateFields.join(', ')} WHERE id = ?`
        ).run(...updateValues);

        const updatedBoard = db.prepare(
            'SELECT * FROM boards WHERE id = ?'
        ).get(boardId);

        res.json({
            success: true,
            message: 'Board updated successfully',
            data: updatedBoard
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBoard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { boardId } = req.params;
        const userId = (req as any).user?.userId;
        const archive = req.query.archive === 'true';

        const board = db.prepare(
            'SELECT * FROM boards WHERE id = ?'
        ).get(boardId);

        if (!board) {
            throw new NotFoundError('Board', boardId);
        }

        if (board.ownerId !== userId) {
            throw new AppError('Only board owner can delete', 403);
        }

        if (archive) {
            db.prepare(
                "UPDATE boards SET status = 'archived' WHERE id = ?"
            ).run(boardId);

            res.json({
                success: true,
                message: 'Board archived successfully',
                data: { boardId, status: 'archived' }
            });
        } else {
            db.prepare('DELETE FROM columns WHERE boardId = ?').run(boardId);
            db.prepare('DELETE FROM board_members WHERE boardId = ?').run(boardId);
            db.prepare('DELETE FROM boards WHERE id = ?').run(boardId);

            res.json({
                success: true,
                message: 'Board deleted permanently',
                data: { boardId, deleted: true }
            });
        }
    } catch (error) {
        next(error);
    }
};