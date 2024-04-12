import cors from "@elysiajs/cors";
import Elysia from "elysia";
import ASSETS_API from "./assets/get";

const ROUTE_API = new Elysia()
    .use(cors())
    .get("/api/ping", ({}) => {
        return "pong";
    })
    .get("/api/hello/:name", ({
        params: { name }
    }) => {
        return `Hello, ${name}!`;
    })
    .use(ASSETS_API);

export default ROUTE_API;