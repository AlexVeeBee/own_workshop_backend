import cors from "@elysiajs/cors";
import Elysia from "elysia";
import WORKSHOP_API from "./workshop/get";
import INFO_CONFIG_API from "./info_configurer/get";
import USER_LOGIN from "./users/login";
import USER_ROUTE from "./users/get";
import ROUTE_UPLOAD from "./upload/extractTags";

const ROUTE_API = new Elysia()
    .use(cors(
        {
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE"],
        }
    ))
    .get("/v1/ping", ({}) => {
        return "pong";
    }, {
        tags: ["API"]
    })
    .use(INFO_CONFIG_API)
    .use(WORKSHOP_API)
    .use(USER_ROUTE.USERS_API)
    .use(USER_ROUTE.USER_API)
    .use(USER_LOGIN)
    .use(ROUTE_UPLOAD)
    .onError(({error, code, set, body}) => {
        log.error("Handling error");
        console.log({
            "error": error,
            "code": code,
            "set": set,
            "body": body,
        })
        switch (code) {
            case "INTERNAL_SERVER_ERROR":
                return new Response("Internal server error", { status: 500 });
            case "VALIDATION":
                return new Response("Internal validation error", { status: 500 });
            case "NOT_FOUND":
                return new Response("Not found", { status: 404 });
            case "PARSE":
                return new Response("Parse error", { status: 400 });
            case "INVALID_COOKIE_SIGNATURE":
                return new Response("Invalid cookie signature", { status: 400 });
            case "UNKNOWN":
                return new Response("Unknown error", { status: 500 });
            default:
                return new Response("Bad request", { status: 400 });
        }
        // console.error("Error", error);

        // console.error(error);
        // log.error(`> Returning 500 <`); 
    })

export default ROUTE_API;