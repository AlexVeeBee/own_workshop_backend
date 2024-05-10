export type DBTypes =
    | "mysql"
    | "postgres"
    | "mongodb"

interface IDatabaseConnection {
}

class Connection implements IDatabaseConnection {
    private db: DBTypes;

    constructor(db: DBTypes) {
        this.db = db;
    }
}

class Database {
    private type: DBTypes;

    constructor(type: DBTypes) {
        this.type = type;
    }

    public query(query: string): Promise<any> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(`Query: ${query}`);
            }, 1000);
        });
    }
}

export default Database;