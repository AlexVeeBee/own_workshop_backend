import type { PoolClient } from 'pg';
import { Pool } from 'pg';
import IDatabse from './database';

class DBpostgressHandler extends IDatabse {
    private client: PoolClient | null = null;
    private pool: Pool;

    constructor() {
        super("postgres");
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASS,
            port: parseInt(process.env.DB_PORT || "5432") || 5432,
        });
        log.success("Postgres database handler initialized!");
        this.testConnection();
    }

    public async testConnection(): Promise<boolean> {
        try {
            await this.connect();
            if (this.client == null) { 
                log.error("Client is null!");
                return false;
            }
            log.success("Connected to the database!");
            await this.query("SELECT NOW()");
            log.success("Test query successful!");
            return true;
        } catch (error) {
            log.error("Failed to connect to the database!");
            console.error(error);
            log.error("Failed to connect to the database!");
            return false;
        }
    }

    private async connect() {
        this.client = await this.pool.connect();
    }

    public async query(query: string): Promise<any> {
        if (!this.client) { 
            await this.connect(); 
        }
        if (this.client == null) { return null; }
        const res = await this.client.query(query);
        this.client.release();
        return res.rows;
    }
}

export default DBpostgressHandler;