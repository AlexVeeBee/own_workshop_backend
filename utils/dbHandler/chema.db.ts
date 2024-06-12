import { Pool } from 'pg';

interface dbschema {
    dbname: string;
    tables: string[];
    views: string[];
    functions: string[];
    triggers: string[];
    procedures: string[];
}

class Schema {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    public async getSchema(): Promise<dbschema> {
        const db = process.env.DB_NAME;
        if (!db) throw new Error("No database name found!");
        const res = await this.pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        const tables = res.rows.map((row: any) => row.table_name);

        const res2 = await this.pool.query(`
            SELECT routine_name
            FROM information_schema.routines
            WHERE routine_schema = 'public'
            ORDER BY routine_name;
        `);
        const functions = res2.rows.map((row: any) => row.routine_name);

        return {
            dbname: db,
            tables,
            views: [],
            functions,
            triggers: [],
            procedures: [],
        };
    }

    public async createTable(name: string, columns: string[]): Promise<boolean> {
        const res = await this.pool.query(`
            CREATE TABLE ${name} (
                ${columns.join(", ")}
            );
        `);
        if (!res.rowCount) return false;
        return res.rowCount > 0;
    }
}

export type DBSchemaType =
    | 'serial'
    | 'int'
    | 'int[]'
    | 'varchar'
    | 'varchar[]'
    | 'timestamp'
    | 'boolean'
    | 'json';
type DBSchemaTypeLength = 'int' | 'varchar';

export interface IDBISchema {
    name: string,
    type: DBSchemaType,
    position?: number,
    length?: number,
    notNull?: boolean,
    isPrimary?: boolean,
    isUnique?: boolean,
    default?: string,
}

const LOGIN_TOKENS_SCHEMA: IDBISchema[] = [
    { name: 'id', type: 'serial', notNull: true, isPrimary: true, isUnique: true},
    { name: 'user_id', type: 'int', notNull: true },
    { name: "token", type: "varchar", length: 255, notNull: true },
]

const USER_SCHEMA: IDBISchema[] = [
    { name: 'id', type: 'serial', notNull: true, isPrimary: true, isUnique: true},
    { name: 'username', type: 'varchar', length: 255, notNull: true, isUnique: true},
    { name: 'password', type: 'varchar', length: 255, notNull: true },
    { name: 'email', type: 'varchar', length: 255, notNull: true, },
]

const USER_SETTINGS_SCHEMA: IDBISchema[] = [
    { name: 'id', type: 'serial', notNull: true, isPrimary: true, isUnique: true},
    { name: 'user_id', type: 'int', notNull: true },
    { name: 'setting', type: 'varchar', length: 255, notNull: true },
    { name: 'value', type: 'varchar', length: 255, notNull: true },
]

const ITEMS_SCHEMA: IDBISchema[] = [
    { name: 'id', type: 'serial', notNull: true, isPrimary: true, isUnique: true},
    { name: 'name', type: 'varchar', length: 255, notNull: true },
    { name: 'description', type: 'varchar', notNull: true },
    { name: 'short_description', type: 'varchar', length: 255, notNull: true },
    { name: 'tags', type: 'varchar[]', notNull: true },
    { name: 'thumb', type: 'varchar', length: 255, notNull: true },
    { name: 'media', type: 'varchar[]', notNull: true },
    { name: 'owner', type: 'int', notNull: true },
    { name: 'authors', type: 'int[]', notNull: true },
    { name: 'nsfw', type: 'boolean', notNull: true },
    { name: 'created', type: 'timestamp', notNull: true },
    { name: 'updated', type: 'timestamp', notNull: true },
    { name: 'properties', type: 'json', notNull: true },
]