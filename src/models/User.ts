export interface User {
    id: number;
    email: string;
    passwordHash: string;
    name?: string;
    role: 'owner' | 'admin' | 'user' | 'guest';
    accessState: 'active' | 'inactive' | 'blocked';
    createdAt: Date;
}