import cors from "@elysiajs/cors";
import Elysia from "elysia";
import WORKSHOP_API from "./workshop/get";
import USER_API from "./users/get";
import INFO_CONFIG_API from "./info_configurer/get";
import USER_LOGIN from "./users/login";

const ROUTE_API = new Elysia()
    .use(cors(
        {
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE"],
        }
    ))
    .get("/api/ping", ({}) => {
        return "pong";
    }, {
        tags: ["API"]
    })
    .use(INFO_CONFIG_API)
    .use(WORKSHOP_API)
    .use(USER_API)
    .use(USER_LOGIN)
    .onError((error) => {
        log.error(error);
        log.error(`An error occurred! Returning 500`);
        return new Response("Internal Server Error", { status: 500 });
    })

export default ROUTE_API;