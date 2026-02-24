import { Request, Response } from 'express';
import { db } from '../config/database';

export const testDB = (req: Request, res: Response) => {
    try {
        const stmt = db.prepare('SELECT name FROM sqlite_master WHERE type = ?');
        const tables = stmt.all('table');

        res.json({
            success: true,
            message: 'Database connection successful',
            tables: tables.map((t: any) => t.name)
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
};

export const testAPI = (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
};