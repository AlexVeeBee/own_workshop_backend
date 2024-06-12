import Database, { type DBTypes } from "./database";
import DBpostgressHandler from "./handle.pg";

class DBHandler {
  private db: Database;

  constructor() {
    this.db = new Database(
        process.env.DB_TYPE as DBTypes || "postgres"
    );

    this.setupHandler();
  }

  public async setupHandler() {
    log.info(`Setting up the database handler for ${this.db.getType()}...`);
    switch (this.db.getType()) {
      case "postgres":
        this.db = new DBpostgressHandler();
        break;
      default:
        break;
    }
  }

  public async get(query: string): Promise<any> {
    return this.db.query(query);
  }
}

export default DBHandler;