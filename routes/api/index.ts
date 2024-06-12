import cors from "@elysiajs/cors";
import Elysia from "elysia";
import WORKSHOP_API from "./workshop/get";
import INFO_CONFIG_API from "./info_configurer/get";
import USER_LOGIN from "./users/login";
import USER_ROUTE from "./users/get";

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
    .onError((error) => {
        log.error("Caught an error!");
        console.error(error);
        log.error(`> Returning 500 <`); 
        return new Response("Internal Server Error", { status: 500 });
    })

export default ROUTE_API;