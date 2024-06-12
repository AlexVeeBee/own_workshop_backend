import Elysia, { t } from "elysia";
import type { IUser } from "../../../utils/types";
import fs from "fs";
import type { v1Prefix } from "../../../utils/vars";

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

interface UserConfig {
    nsfw?: boolean;
    admin?: boolean;
    created?: Date;
}

class User {
    id: number;
    username: string;
    pfp: string | null;
    banner?: string | null;
    folder?: string;
    nsfw: boolean = false;
    admin: boolean = false;
    created: Date = new Date();
    constructor(id: number, username: string, pfp: string | null, config?: UserConfig) {
        this.id = id;
        this.username = username;
        this.pfp = pfp;

        if (config) {
            this.nsfw = config.nsfw || false;
            this.admin = config.admin || false;
            this.created = config.created || new Date();
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
            throw new Error("PFP not found! attempting to access: " + `${this.folder}`);
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
                admin: this.admin,
                created: this.created,
            }
        } catch (error: any) {
            log.error("Failed to veryfiy images", error.message);
            return {
                id: this.id,
                username: this.username,
                pfp: this.pfp,
                banner: null,
                nsfw: this.nsfw,
                admin: this.admin,
                created: this.created,
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

const firstNames: string[] = [
    "Joseph",
    "John",
    "Robert",
    "Michael",
    "William",
    "David",
    "Richard",
    "Charles",
    "Joseph",
    "Thomas",
    "Daniel",
    "Matthew",
    "Anthony",
    "Donald",
    "Mark",
    "Paul",
    "Steven",
    "Andrew",
    "Kenneth",
    "Joshua",
    "George",
    "Kevin",
    "Brian",
    "Edward",
    "Ronald",
    "Timothy",
    "Jason",
    "Jeffrey",
    "Frank",
    "Gary",
    "Ryan",
    "Nicholas",
    "Eric",
    "Stephen",
    "Jacob",
    "Larry",
    "Jonathan",
    "Scott",
    "Raymond",
    "Justin",
    "Brandon",
    "Gregory",
    "Samuel",
    "Benjamin",
    "Patrick",
    "Jack",
    "Henry",
    "Walter",
    "Dennis",
    "Jerry",
    "Alexander",
    "Mary",
    "Patricia",
    "Jennifer",
    "Linda",
    "Elizabeth",
    "Barbara",
    "Susan",
    "Jessica",
    "Sarah",
    "Karen",
    "Nancy",
    "Lisa",
    "Betty",
    "Dorothy",
    "Sandra",
    "Ashley",
    "Kimberly",
    "Donna",
    "Emily",
    "Michelle",
    "Carol",
    "Amanda",
    "Melissa",
    "Deborah",
    "Stephanie",
    "Rebecca",
    "Laura",
    "Sharon",
    "Cynthia",
    "Kathleen",
    "Helen",
    "Amy",
    "Shirley",
    "Angela",
    "Anna",
    "Ruth",
    "Brenda",
    "Pamela",
    "Nicole",
    "Katherine",
    "Virginia",
    "Catherine",
    "Christine",
    "Samantha",
    "Debra",
    "Janet",
    "Carolyn",
    "Rachel",
    "Heather",
    "Maria",
    "Diane",
    "Emma",
    "Julie",
    "Joyce",
    "Frances",
    "Evelyn",
    "Joan",
    "Christina",
    "Kelly",
    "Martha",
]

const lastNames: string[] = [
    "Doe",
    "Smith",
    "Johnson",
    "Williams",
    "Jones",
    "Brown",
    "Davis",
    "Miller",
    "Wilson",
    "Moore",
    "Taylor",
    "Anderson",
    "Thomas",
    "Jackson",
    "White",
    "Harris",
    "Martin",
    "Thompson",
    "Garcia",
    "Martinez",
    "Robinson",
    "Clark",
    "Rodriguez",
    "Lewis",
    "Lee",
    "Walker",
    "Hall",
    "Allen",
    "Young",
    "Hernandez",
    "King",
    "Wright",
    "Lopez",
    "Hill",
    "Scott",
    "Green",
    "Adams",
    "Baker",
    "Gonzalez",
    "Nelson",
    "Carter",
    "Mitchell",
    "Perez",
    "Roberts",
    "Turner",
    "Phillips",
    "Campbell",
    "Parker",
    "Evans",
    "Edwards",
    "Collins",
    "Stewart",
    "Sanchez",
    "Morris",
    "Rogers",
    "Reed",
    "Cook",
    "Morgan",
    "Bell",
    "Murphy",
    "Bailey",
    "Rivera",
    "Cooper",
    "Richardson",
    "Cox",
    "Howard",
    "Ward",
    "Torres",
    "Peterson",
    "Gray",
    "Ramirez",
    "James",
    "Watson",
    "Brooks",
    "Kelly",
    "Sanders",
    "Price",
    "Bennett",
    "Wood",
    "Barnes",
    "Ross",
    "Henderson",
    "Coleman",
    "Jenkins",
    "Perry",
    "Powell",
    "Long",
    "Patterson",
    "Hughes",
    "Flores",
    "Washington",
    "Butler",
    "Simmons",
    "Foster",
    "Gonzales",
    "Bryant",
    "Alexander",
    "Russell",
    "Griffin",
    "Diaz",
    "Hayes",
]

const usersPlaceholder: User[] = [
    new User(1, "Admin", getPFP(1), { admin: true }),
    new User(2, "Cat", getPFP(2), { admin: true, nsfw: true }),
    new User(3, "John Doe", getPFP(3)),
    new User(4, "Jane Doe", getPFP(4)),
    new User(5, "Lord", getPFP(5), { nsfw: true, }),
    ...Array.from({ length: 5 }, (_, index) => {
        const id = index + 6;
        const username = `${firstNames[randomNumber(0, firstNames.length - 1)]} ${lastNames[randomNumber(0, lastNames.length - 1)]}`;
        return new User(id, username, getPFP(250));
    })
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

const USERS_API = new Elysia({
    prefix: "/v1/users" as v1Prefix
})
    .get("/", ({
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
            limit:t.Optional( t.Numeric({ minimum: 0, default: 20,})),
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
    .get("/count", () => {
        return usersPlaceholder.length;
    }, {
        tags: ["API", "User"],
    })

const USER_API = new Elysia({
    prefix: "/v1/user" as v1Prefix
})    
    .get("/get/:id", ({
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
    .get("/verify/:id", ({
        params: { id }
    }) => {
        log.info(`Getting user with id ${id}`);
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

const USER_ROUTE = {
    USERS_API,
    USER_API,
}

export default USER_ROUTE;