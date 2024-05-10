import cors from "@elysiajs/cors";
import Elysia from "elysia";
import WORKSHOP_API from "./workshop/get";
import USER_API from "./users/get";
import INFO_CONFIG_API from "./info_configurer/get";

const ROUTE_API = new Elysia()
    .use(cors())
    .get("/api/ping", ({}) => {
        return "pong";
    }, {
        tags: ["API"]
    })
    .use(INFO_CONFIG_API)
    .use(WORKSHOP_API)
    .use(USER_API)
    .onError((error) => {
        log.error(error);
        return new Response("Internal Server Error", { status: 500 });
    })

export default ROUTE_API;