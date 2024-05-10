import Database, { type DBTypes } from "./database";

class DBHandler {
  private db: Database;

  constructor() {
    this.db = new Database(
        process.env.DB_TYPE as DBTypes || "mysql"
    );
  }

  public async get(query: string): Promise<any> {
    return this.db.query(query);
  }
}