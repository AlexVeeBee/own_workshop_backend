import Elysia, { t } from "elysia";
import type { IUser } from "../../../utils/types";
import { getUserBasic } from "./get";

const createUUID = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

class FakeAccount {
    loginToken: string;
    id: number;
    username: string;
    email: string;
    password: string;
    constructor(id: number, email: string, username: string, password: string) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.id = id;
        this.loginToken = createUUID();
    }
}

const placeholder = [
    new FakeAccount(1, "owner@m.com", "test", "test"),
    new FakeAccount(2, "admin@m.com", "admin", "admin"),
    new FakeAccount(3, "user@m.com", "user", "user"),
    new FakeAccount(5, "lord@m.com", "lord", "lord")
]

const REGEX_USERNAME = /^[a-zA-Z0-9_]{3,16}$/;
const REGEX_PASSWORD = /^[a-zA-Z0-9_]{8,32}$/;

const toString = (value: any) => {
    if (typeof value === "object") {
        return JSON.stringify(value);
    }
    return value.toString();
}

const USER_LOGIN = new Elysia()
    .post("/api/user/login", ({
        body: body
    }) => {
        if (!body) {
            return new Response("MISSING_BODY", {
                status: 400
            });
        }

        const { username, password } = JSON.parse(body);

        const user = placeholder.find(user => user.username === username && user.password === password);
        if (!user) {
            return new Response("USER_NOT_FOUND", {
                status: 404
            });
        }

        const basic = getUserBasic(user.id);
        const r = {
            token: user.loginToken,
            ...basic
        } as IUser & {
            token: string
        };
        return r;
    }, {
        method: "POST",
        body: t.String(),
        tags: ["API","User"],
        detail: {
            description: "Login a user",
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                username: { type: "string" },
                                password: { type: "string" }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "User logged in",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    id: { type: "number" },
                                    username: { type: "string" },
                                    pfp: { type: "string" },
                                    banner: { type: "string" },
                                    token: { type: "string" }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Missing body",
                    content: {
                        "text/plain": {
                            schema: {
                                type: "string"
                            }
                        }
                    }
                },
                404: {
                    description: "User not found",
                    content: {
                        "text/plain": {
                            schema: {
                                type: "string"
                            }
                        }
                    }
                }
            }
        }
    })
    .get("/api/user/logout", () => {
        return new Response("NOT_IMPLEMENTED", {
            status: 200
        });
    }, {
        tags: ["API","User"],
        detail: {
            description: "Logout a user",
            responses: {
                501: {
                    description: "Not implemented",
                    content: {
                        "text/plain": {
                            schema: {
                                type: "string"
                            }
                        }
                    }
                }
            }
        }
    })
    .get("/api/user/login/:token", ({
        params: { token },
        query: { pulldata }
    }) => {
        const user = placeholder.find(user => user.loginToken === token);
        if (!user) {
            return new Response("USER_NOT_FOUND", {
                status: 404
            });
        }
        const basic = getUserBasic(user.id);

        if (!pulldata) {
            return new Response("VERYFIED", {
                status: 200
            });
        }

        console.table(basic);

        const r = {
            token: user.loginToken,
            ...basic
        } as IUser & {
            token: string
        };
        return r;
    }, {
        tags: ["API","User"],
        query: t.Object({
            pulldata: t.Optional(t.String())
        }),
        detail: {
            description: "Verify a user",
            responses: {
                200: {
                    description: "User verified",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    id: { type: "number" },
                                    username: { type: "string" },
                                    pfp: { type: "string" },
                                    banner: { type: "string" },
                                    token: { type: "string" }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "User not found",
                    content: {
                        "text/plain": {
                            schema: {
                                type: "string"
                            }
                        }
                    }
                }
            }
        }
    })

export default USER_LOGIN;
