import Elysia from "elysia";
import type { IUser } from "../../../utils/types";
import fs from "fs";

const folder = "assets/users";

const match_pfp = /pfp\.(jpg|jpeg|png|gif|webp)/;
const match_banner = /banner\.(jpg|jpeg|png|gif|webp)/;

const fileConflicts = (folder: string) => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
    const files = fs.readdirSync(folder);
    const conflicts = files.filter(file => {
        return !fs.lstatSync(`${folder}/${file}`).isDirectory();
    });
    log.info(`Conflicts: ${conflicts}`);
    return conflicts;
}

const getPFP = (id: number) => {
    const path = `${folder}/${id}/`;
    if (!fs.existsSync(path)) { return null; }
    const pfp = fs.readdirSync(path).find(file => file.match(match_pfp));
    if (pfp) {
        return `${path}/${pfp}`;
    }
    return null;
}

const getBanner = (id: number) => {
    const path = `${folder}/${id}/`;
    if (!fs.existsSync(path)) { return null; }
    const banner = fs.readdirSync(path).find(file => file.match(match_banner));
    if (banner) {
        return `${path}/${banner}`;
    }
    return null;
}

class User {
    private folderListener: fs.FSWatcher | null = null;
    id: number;
    username: string;
    pfp: string | null;
    banner?: string | null;
    folder?: string;
    constructor(id: number, username: string, pfp: string | null) {
        this.id = id;
        this.username = username;
        this.pfp = pfp;
        this.init();
    }

    setupFolder() {
        if (!this.folder) {
            if(!fs.existsSync(folder)) {
                fs.mkdirSync(folder);
            }
            this.folder = `${folder}/${this.id}`;
        }
    }

    init() {
        this.setupFolder();
        this.watchFolder();
    }

    setFolder(folder: string) {
        this.folder = folder;
    }

    verifyImages(): {
        pfp: string,
        banner: string | null,
    } {
        log.info(`Verifying images for user ${this.id}`);
        if (!this.folder) {
            throw new Error("Folder not set!");
        }
        let pfp = getPFP(this.id);
        let banner = getBanner(this.id);

        if (!pfp) {
            throw new Error("PFP not found!");
        }
        // banner is optional
        if (banner && !fs.existsSync(banner)) {
            throw new Error("Banner not found!");
        }
        
        return {
            pfp,
            banner,
        }
    }

    getUserJSON(): IUser {
        // verify images
        try {
            const verify = this.verifyImages();
            
            return {
                id: this.id,
                username: this.username,
                pfp: verify.pfp,
                banner: verify.banner,
            }
        } catch (error) {
            log.error(error);
            return {
                id: this.id,
                username: this.username,
                pfp: this.pfp,
                banner: null,
            }
        }
    }

    folderCheck() {
        if (!this.folder) {
            throw new Error("Folder not set!");
        }
        if (!fs.existsSync(this.folder)) {
            fs.mkdirSync(this.folder);
        }
        const files = fs.readdirSync(this.folder);
        if (!files.find(file => file.match(match_pfp))) {
            throw new Error("PFP not found!");
        }
    }

    watchFolder() {
        if (!this.folder) {
            throw new Error("Folder not set!");
        }
        if (!fs.existsSync(this.folder)) {
            fs.mkdirSync(this.folder);
        }
        if (this.folderListener) {
            this.folderListener.close();
        }
        // check if foler is being watched from another instance

        this.folderListener = fs.watch(this
            .folder, (event, filename) => {
                log.info(`[${this.folder}] Event: ${event}, Filename: ${filename}`);
                // rip the extension
                const file = filename?.split(".")[0];
                if (file === "pfp") {
                    this.pfp = getPFP(this.id);
                }
                if (file === "banner") {
                    this.banner = getBanner(this.id);
                }
            });

        setTimeout(() => {
            if(!this.folderListener) {
                return;
            }
            this.folderListener.close();
            log.warn(`Folder ${this.folder} was closed! Timeout reached!`);
        }, 1000 * 60 * 5 ); // 5 minutes
    }
}

const usersPlaceholder: User[] = [
    new User(1, "Admin", getPFP(1)),
    new User(2, "Cat", getPFP(2)),
    new User(3, "John Doe", getPFP(3)),
    new User(4, "Jane Doe", getPFP(4)),
]

export const getUserBasic = (id: number): IUser  => {
    if (typeof id !== "number") {
        throw new Error("Invalid id!");
    }
    const user = usersPlaceholder.find(user => user.id === id);
    if (!user) {
        throw new Error(`User with id ${id} not found!`);
    }
    return user.getUserJSON();
}

const USER_API = new Elysia()
    .get("/api/users", () => {
        log.info("Users were requested!");
        return usersPlaceholder.map(user => user.getUserJSON());
    })
    .get("/api/user/get/:id", ({
        params: { id }
    }) => {
        log.info(`User with id ${id} was requested!`);
        const user = usersPlaceholder.find(user => user.id === parseInt(id));
        if (!user) {
            return new Response("NOT_FOUND", { status: 404 });
        }
        return user.getUserJSON();
    }, {
        tags: ["API", "User"],
    });

export default USER_API;