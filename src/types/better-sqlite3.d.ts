declare module 'better-sqlite3' {
    class Statement {
        run(...params: any[]): { lastInsertRowid: number; changes: number };
        get(...params: any[]): any;
        all(...params: any[]): any[];
    }

    class Database {
        constructor(filename: string, options?: any);
        exec(sql: string): void;
        prepare(sql: string): Statement;
        pragma(sql: string, options?: { simple: boolean }): any;
    }

    export = Database;
    export default Database;
}