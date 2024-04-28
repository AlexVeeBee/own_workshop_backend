import Elysia from "elysia";
import type { User } from "../../../utils/types";
import fs from "fs";

const folder = "assets/users";

const getPFP = (id: number) => {
    const path = `${folder}/${id}/`;
    if (!fs.existsSync(path)) {
        return null;
    }
    const pfp = fs.readdirSync(path).find(file => file.match(/pfp\.(jpg|jpeg|png|gif)/));
    if (pfp) {
        return `${path}/${pfp}`;
    }
    return null;
}

const usersPlaceholder = [
    {
        id: 1,
        username: "Admin",
        // description: "This is the first user",
        pfp: getPFP(1)
    },
    {
        id: 2,
        username: "Cat",
        // description: "Placeholder is for developers to test the API and see how it works.",
        pfp: getPFP(2)
    },
    {
        id: 3,
        username: "John Doe",
        // description: "John Doe is a placeholder name commonly used in the United States and other English-speaking countries, as well as in other Western countries.",
        pfp: getPFP(3)
    },
]



export const getUserBasic = (id: number): User  => {
    if (typeof id !== "number") {
        throw new Error("Invalid id!");
    }
    const user = usersPlaceholder.find(user => user.id === id);
    if (!user) {
        throw new Error(`User with id ${id} not found!`);
    }
    return user;
}

const USER_API = new Elysia()
    .get("/api/user/get/:id", ({
        params: { id }
    }) => {
        log.info(`User with id ${id} was requested!`);
        const user = usersPlaceholder.find(user => user.id === parseInt(id));
        if (!user) {
            return new Response("NOT_FOUND", { status: 404 });
        }
        return user;
    }, {
        tags: ["API", "User"],
    });

export default USER_API;