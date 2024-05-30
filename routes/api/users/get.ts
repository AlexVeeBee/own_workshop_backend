import Elysia, { t } from "elysia";
import type { IUser } from "../../../utils/types";
import fs from "fs";

const folder = "assets/users";

const match_pfp = /pfp\.(jpg|jpeg|png|gif|webp)/;
const match_banner = /banner\.(jpg|jpeg|png|gif|webp)/;

const getPFP = (id: number) => {
    const path = `${folder}/${id}/`;
    if (!fs.existsSync(path)) { return null; }
    const pfp = fs.readdirSync(path).find(file => file.match(match_pfp));
    if (pfp) {
        return `${path}${pfp}`;
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
    id: number;
    username: string;
    pfp: string | null;
    banner?: string | null;
    folder?: string;
    nsfw: boolean = false;
    constructor(id: number, username: string, pfp: string | null, config?: {
        nsfw?: boolean,
    }) {
        this.id = id;
        this.username = username;
        this.pfp = pfp;

        if (config) {
            this.nsfw = config.nsfw || false;
        }

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
                nsfw: this.nsfw,
            }
        } catch (error) {
            log.error(error);
            return {
                id: this.id,
                username: this.username,
                pfp: this.pfp,
                banner: null,
                nsfw: this.nsfw,
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
        // const files = fs.readdirSync(this.folder);
        // if (!files.find(file => file.match(match_pfp))) {
        //     throw new Error("PFP not found!");
        // }
    }
}

const randomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const usersPlaceholder: User[] = [
    new User(1, "Admin", getPFP(1)),
    new User(2, "Cat", getPFP(2)),
    new User(3, "John Doe", getPFP(3)),
    new User(4, "Jane Doe", getPFP(4)),
    new User(5, "Lord", getPFP(5), { nsfw: true, }),
    new User(6, `User${randomNumber(100, 999)}`,  getPFP(250)),
    new User(7, `User${randomNumber(100, 999)}`,  getPFP(250)),
    new User(8, `User${randomNumber(100, 999)}`,  getPFP(250)),
    new User(9, `User${randomNumber(100, 999)}`,  getPFP(250)),
    new User(10, `User${randomNumber(100, 999)}`, getPFP(250)),
    new User(11, `User${randomNumber(100, 999)}`, getPFP(250)),
    new User(12, `User${randomNumber(100, 999)}`, getPFP(250)),
    new User(13, `User${randomNumber(100, 999)}`, getPFP(250)),
    new User(14, `User${randomNumber(100, 999)}`, getPFP(250)),
    new User(15, `User${randomNumber(100, 999)}`, getPFP(250)),
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
    .get("/api/users", ({
        query: { limit, offset, search }
    }) => {
        search = search || "";
        log.info("Users were requested!");
        if (typeof limit !== "number" || typeof offset !== "number") {
            return new Response("INVALID_PARAMS", { status: 400 });
        }
        if (limit < 0 || offset < 0) {
            return new Response("INVALID_PARAMS", { status: 400 });
        }

        if (typeof search === "string") {
            // no need to be case sensitive
            search = search.toLowerCase();
            const users = usersPlaceholder.filter(user => user.username.toLowerCase().includes(search as string));
            return users.slice(offset, offset + limit).map(user => user.getUserJSON());
        }
        return usersPlaceholder.slice(offset, offset + limit).map(user => user.getUserJSON());
    }, {
        tags: ["API", "User"],
        query: t.Object({
            limit:t.Optional( t.Numeric({ minimum: 0, default: 10,})),
            offset:t.Optional(t.Numeric({ minimum: 0, default: 0 })),
            search: t.Optional(t.String()),
        }),
        detail: {
            description: "Get all users",
            responses: {
                200: {
                    description: "Users found",
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: { type: "number" },
                                        username: { type: "string" },
                                        pfp: { type: "string" },
                                        banner: { type: "string" },
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    .get("/api/users/count", () => {
        return usersPlaceholder.length;
    }, {
        tags: ["API", "User"],
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
    })
    .get("/api/user/verify/:id", ({
        params: { id }
    }) => {
        log.info(`Verifying user with id ${id}`);
        const user = usersPlaceholder.find(user => user.id === parseInt(id));
        if (!user) {
            return new Response("NOT_FOUND", { status: 404 });
        }
        try {
            user.folderCheck();
            return getUserBasic(user.id);
        } catch (error: any) {
            log.error(error);
            return new Response("ERROR", { status: 500, statusText: error.message });
        }
    }, {
        tags: ["API", "User"],
    })

export default USER_API;