import Logger from "./utils/logger";
import Elysia from "elysia";
import staticPlugin from "@elysiajs/static";
import { cors } from '@elysiajs/cors'
import ROUTE_API from "./routes/api";
import index from "./routes/index/main";

const port = 8080;
const log = new Logger();

declare global {
    var log: Logger;
}

globalThis.log = log;

log.log("Starting the workshop...");
// log.error("An error occurred!");
// log.info("Informational message!");

await Bun.build({
    entrypoints: ['./src/react/index.tsx'],
    outdir: './public',
});
  
new Elysia()
    .use(staticPlugin({
        assets: "public",
        prefix: "/public"
    }))
    .use(ROUTE_API)
    .state("author", "AlexVeeBee")
    .state("version", "1.0.0")
    .listen(port, () => {
        log.info(`Server is running on port ${port}
        > http://localhost:${port}
        `);
    });

